import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const upstash =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;

const limiters = new Map<string, Ratelimit>();
const memory = new Map<string, number[]>(); // dev/single-instance fallback

/** Sliding-window rate limit. Uses Upstash in production, an in-memory window otherwise. */
export async function rateLimit(bucket: string, id: string, max: number, windowSec: number) {
  if (upstash) {
    const k = `${bucket}:${max}:${windowSec}`;
    let rl = limiters.get(k);
    if (!rl) {
      rl = new Ratelimit({ redis: upstash, limiter: Ratelimit.slidingWindow(max, `${windowSec} s`), prefix: `rl:${bucket}` });
      limiters.set(k, rl);
    }
    const r = await rl.limit(id);
    return { ok: r.success };
  }
  const key = `${bucket}:${id}`;
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < windowSec * 1000);
  if (hits.length >= max) return { ok: false };
  hits.push(now);
  memory.set(key, hits);
  return { ok: true };
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
