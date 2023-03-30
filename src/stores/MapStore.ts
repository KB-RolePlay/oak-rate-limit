import type { Ratelimit } from "../types/types.d.ts";
import { Store } from "./AbstractStore.ts";

export class MapStore extends Store {
  private readonly store: Map<string, Ratelimit>;

  constructor() {
    super();
    this.store = new Map<string, Ratelimit>();
  }

  public init() {
    return;
  }

  public get(ip: string, uniqueMaxName: string) {
    return this.store.get(`${ip}-${uniqueMaxName}`);
  }

  public set(ip: string, uniqueMaxName: string, ratelimit: Ratelimit) {
    return this.store.set(`${ip}-${uniqueMaxName}`, ratelimit);
  }

  public delete(ip: string, uniqueMaxName: string) {
    return this.store.delete(`${ip}-${uniqueMaxName}`);
  }

  public has(ip: string, uniqueMaxName: string) {
    return this.store.has(`${ip}-${uniqueMaxName}`);
  }
}
