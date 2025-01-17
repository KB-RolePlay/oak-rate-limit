import {
  connect,
  Redis,
  RedisConnectOptions,
} from "https://deno.land/x/redis@v0.26.0/mod.ts";
import type { Ratelimit } from "../types/types.d.ts";
import { Store } from "./AbstractStore.ts";

export class RedisStore extends Store {
  private store: Redis | undefined;
  private options: RedisConnectOptions;
  private initialized: boolean;

  constructor(options: RedisConnectOptions) {
    super();
    this.options = options;
    this.initialized = false;
  }

  public async init() {
    this.store = await connect({
      hostname: this.options.hostname,
      port: this.options.port,
      tls: this.options.tls,
      db: this.options.db,
      password: this.options.password,
      name: this.options.name,
      maxRetryCount: this.options.maxRetryCount,
    });

    this.initialized = true;
  }

  public async get(ip: string, uniqueMaxName: string) {
    if (!this.isConnected) throw "[oak-rate-limit] RedisStore is not connected";
    const data = await this.store!.get(`${ip}-${uniqueMaxName}`);
    if (!data) return;
    return JSON.parse(data);
  }

  public async set(ip: string, uniqueMaxName: string, ratelimit: Ratelimit) {
    if (!this.isConnected) throw "[oak-rate-limit] RedisStore is not connected";

    const newRatelimit = await this.store!
      .set(`${ip}-${uniqueMaxName}`, JSON.stringify(ratelimit));
    return JSON.parse(newRatelimit);
  }

  public async delete(ip: string, uniqueMaxName: string) {
    if (!this.isConnected) throw "[oak-rate-limit] RedisStore is not connected";

    const value = Boolean((await this.store!).del(`${ip}-${uniqueMaxName}`));
    return value;
  }

  public async has(ip: string, uniqueMaxName: string) {
    if (!this.isConnected) throw "[oak-rate-limit] RedisStore is not connected";

    const value = Boolean((await this.store!).exists(`${ip}-${uniqueMaxName}`));
    return value;
  }

  private get isConnected() {
    return Boolean(this.initialized && this.store && this.store.isConnected);
  }
}
