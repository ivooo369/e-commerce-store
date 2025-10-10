import { RateLimitData } from "../types/interfaces";

const requests = new Map<string, RateLimitData>();

setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000;

  for (const [ip, data] of requests.entries()) {
    if (now - data.firstRequest > maxAge) {
      requests.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export const rateLimit = (limit: number, interval: number) => {
  return (
    req: Request
  ): { allowed: boolean; remaining: number; resetTime: number } => {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfConnectingIp = req.headers.get("cf-connecting-ip");

    const ip =
      cfConnectingIp ||
      realIp ||
      (forwarded ? forwarded.split(",")[0].trim() : "unknown");

    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, { count: 0, firstRequest: now });
    }

    const data = requests.get(ip)!;

    if (now - data.firstRequest > interval) {
      data.count = 0;
      data.firstRequest = now;
    }

    data.count++;

    const remaining = Math.max(0, limit - data.count);
    const resetTime = data.firstRequest + interval;

    if (data.count > limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    return {
      allowed: true,
      remaining,
      resetTime,
    };
  };
};

export const universalRateLimit = rateLimit(5, 60 * 1000);

export const createRateLimitResponse = (
  remaining: number,
  resetTime: number
) => {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Твърде много заявки!",
      message: `Надвишен лимит на заявки! Моля, опитайте отново след ${retryAfter} секунди!`,
      remaining: 0,
      resetTime: new Date(resetTime).toISOString(),
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(resetTime).toISOString(),
      },
    }
  );
};
