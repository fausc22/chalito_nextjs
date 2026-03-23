const MIN_POLLING_BLOCK_MS = 60 * 1000;

let pollingBlockedUntil = 0;

const normalizeRetryAfterValue = (retryAfterValue) => {
  if (retryAfterValue == null) return null;
  if (Array.isArray(retryAfterValue)) return retryAfterValue[0];
  return retryAfterValue;
};

const parseRetryAfterToMs = (retryAfterValue) => {
  const normalized = normalizeRetryAfterValue(retryAfterValue);
  if (normalized == null) return null;

  const retryAfterSeconds = Number.parseInt(String(normalized), 10);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return retryAfterSeconds * 1000;
  }

  const retryAfterDate = Date.parse(String(normalized));
  if (Number.isFinite(retryAfterDate)) {
    return Math.max(0, retryAfterDate - Date.now());
  }

  return null;
};

export const setPollingBlocked = ({ retryAfterHeader, retryAfterSeconds } = {}) => {
  const retryAfterMsFromHeader = parseRetryAfterToMs(retryAfterHeader);
  const retryAfterMsFromSeconds = Number.isFinite(Number(retryAfterSeconds))
    ? Number(retryAfterSeconds) * 1000
    : null;
  const retryAfterMs = Math.max(retryAfterMsFromHeader ?? 0, retryAfterMsFromSeconds ?? 0);
  const blockDurationMs = Math.max(MIN_POLLING_BLOCK_MS, retryAfterMs);

  pollingBlockedUntil = Math.max(pollingBlockedUntil, Date.now() + blockDurationMs);

  return {
    blockedUntil: pollingBlockedUntil,
    blockDurationMs,
    remainingMs: Math.max(0, pollingBlockedUntil - Date.now()),
  };
};

export const isPollingBlocked = () => Date.now() < pollingBlockedUntil;

export const getPollingBlockedUntil = () => pollingBlockedUntil;

export const getPollingRemainingMs = () => Math.max(0, pollingBlockedUntil - Date.now());

