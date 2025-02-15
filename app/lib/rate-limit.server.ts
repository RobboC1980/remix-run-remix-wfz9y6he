// Simple in-memory rate limiting implementation
const rateLimits = new Map<string, { attempts: number; resetTime: number }>();

const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_REQUESTS = {
  login: 5,
  signup: 3,
};

// Clean up expired rate limits
function cleanupExpiredLimits() {
  const now = Date.now();
  for (const [key, value] of rateLimits.entries()) {
    if (now > value.resetTime) {
      rateLimits.delete(key);
    }
  }
}

export async function rateLimit(
  ip: string,
  action: 'login' | 'signup'
): Promise<{ success: boolean; remaining: number }> {
  const key = `${action}:${ip}`;
  const now = Date.now();

  // Clean up expired entries
  cleanupExpiredLimits();

  // Get or create rate limit entry
  let rateLimit = rateLimits.get(key);
  if (!rateLimit || now > rateLimit.resetTime) {
    rateLimit = {
      attempts: 0,
      resetTime: now + WINDOW_SIZE,
    };
    rateLimits.set(key, rateLimit);
  }

  // Check if limit exceeded
  if (rateLimit.attempts >= MAX_REQUESTS[action]) {
    return { success: false, remaining: 0 };
  }

  // Increment attempts
  rateLimit.attempts++;
  rateLimits.set(key, rateLimit);

  return {
    success: true,
    remaining: MAX_REQUESTS[action] - rateLimit.attempts,
  };
}