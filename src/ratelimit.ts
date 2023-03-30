import { Context, Middleware } from "../deps.ts";
import type { RatelimitOptions } from "./types/types.d.ts";
import { DefaultOptions } from "./utils/defaults.ts";

export const RateLimiter = async (
  options?: Partial<RatelimitOptions>,
): Promise<Middleware> => {
  const opt = { ...DefaultOptions, ...options };

  await opt.store.init();

  if (typeof opt.onRateLimit !== "function") {
    throw "onRateLimit must be a function.";
  }
  if (typeof opt.skip !== "function") throw "skip must be a function.";

  return async (ctx: Context, next) => {
    const { ip } = ctx.request;
    const timestamp = Date.now();

    const [maxAmount, uniqueMaxName] = await opt.max(ctx);

    if (await opt.skip(ctx)) return next();
    if (opt.headers) {
      ctx.response.headers.set(
        "X-RateLimit-Limit",
        maxAmount.toString(),
      );
    }

    if (
      await opt.store.has(ip, uniqueMaxName) &&
      timestamp -
            (await opt.store.get(ip, uniqueMaxName)!).lastRequestTimestamp >
        opt.windowMs
    ) {
      opt.store.delete(ip, uniqueMaxName);
    }
    if (!opt.store.has(ip, uniqueMaxName)) {
      opt.store.set(ip, uniqueMaxName, {
        remaining: maxAmount,
        lastRequestTimestamp: timestamp,
      });
    }

    if (
      await opt.store.has(ip, uniqueMaxName) &&
      (await opt.store.get(ip, uniqueMaxName)!).remaining === 0
    ) {
      await opt.onRateLimit(ctx, next, opt);
    } else {
      await next();
      if (opt.headers) {
        ctx.response.headers.set(
          "X-RateLimit-Remaining",
          opt.store.get(ip, uniqueMaxName)
            ? (await opt.store.get(ip, uniqueMaxName)!).remaining.toString()
            : maxAmount.toString(),
        );
      }
      opt.store.set(ip, uniqueMaxName, {
        remaining: (await opt.store.get(ip, uniqueMaxName)!).remaining - 1,
        lastRequestTimestamp: timestamp,
      });
    }
  };
};

export const onRateLimit = async (
  ctx: Context,
  _next: () => Promise<unknown>,
  opt: RatelimitOptions,
): Promise<unknown> => {
  const [_maxAmount, uniqueMaxName] = await opt.max(ctx);

  await opt.store.set(ctx.request.ip, uniqueMaxName, {
    remaining: 0,
    lastRequestTimestamp: Date.now(),
  });
  ctx.response.status = opt.statusCode;
  if (opt.headers) ctx.response.headers.set("X-RateLimit-Remaining", "0");
  return ctx.response.body = { error: opt.message };
};
