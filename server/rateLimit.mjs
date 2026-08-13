const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 20;
const DEFAULT_MAX_CLIENTS = 10_000;

export function requestClientId(request) {
  const candidate = request.socket?.remoteAddress || "unknown";
  return candidate.slice(0, 128);
}

export function createRateLimiter({
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
  maxClients = DEFAULT_MAX_CLIENTS,
  now = Date.now,
} = {}) {
  const clients = new Map();

  function prune(timestamp) {
    for (const [key, value] of clients) {
      if (value.resetAt <= timestamp) clients.delete(key);
    }
    while (clients.size >= maxClients) {
      clients.delete(clients.keys().next().value);
    }
  }

  return {
    check(clientId) {
      const timestamp = now();
      let state = clients.get(clientId);
      if (!state || state.resetAt <= timestamp) {
        if (clients.size >= maxClients) prune(timestamp);
        state = { count: 0, resetAt: timestamp + windowMs };
        clients.set(clientId, state);
      }
      state.count += 1;
      return {
        allowed: state.count <= limit,
        limit,
        remaining: Math.max(0, limit - state.count),
        retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - timestamp) / 1000)),
      };
    },
  };
}
