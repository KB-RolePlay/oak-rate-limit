import { Context } from "../../deps.ts";
import { Store } from "../stores/AbstractStore.ts";

export interface Ratelimit {
  remaining: number;
  lastRequestTimestamp: number;
}

export interface RatelimitOptions {
  windowMs: number;
  max: (
    ctx: Context,
  ) => Promise<[number, string]> | [number, string];
  store: Store;
  headers: boolean;
  ipHeader?: string | null;
  message: string;
  statusCode: number;
  skip: (ctx: Context) => Promise<boolean> | boolean;
  onRateLimit: (
    ctx: Context,
    next: () => Promise<unknown>,
    opt: RatelimitOptions,
  ) => unknown;
}
