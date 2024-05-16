/**
 * Source: {@link https://github.com/AmrSaber/simple-redis-mutex/blob/master/src/lua.js}
 */

// language=lua
export const checkLockScript = `
local hasUnlocked = 0
local hasLocked = 0

for i, key in ipairs(KEYS) do
  local locked = redis.call("exists", key)

  if locked == 1 then
    hasLocked = 1
  else
    hasUnlocked = 1
  end
end

if hasLocked == 1 and hasUnlocked == 1 then
  return "PARTIAL_LOCK"
elseif hasLocked == 1 then
  return "LOCKED"
end

return "AVAILABLE"
`;

// Check if the lock key is empty, set it with the provided value and timeout (if provided)
// Otherwise will do nothing (because of NX option) and return nil
// language=lua
export const acquireScript = `
for i, key in ipairs(KEYS) do
  if i % 2 == 1 and redis.call("exists", key) == 1 then
      return 0
  end
end

local timeout = ARGV[2]

if timeout ~= nil and timeout ~= false and timeout ~= "" then
  for i, key in ipairs(KEYS) do
      if i % 2 == 1 then
        redis.call("SET", key, KEYS[i + 1], "NX", "PX", timeout)
      end
  end
end

for i, key in ipairs(KEYS) do
    if i % 2 == 1 then
      redis.call("SET", key, KEYS[i + 1], "NX")
    end
end

return "OK"
` as const;

// Same as acquire + check that the provided id is the next id to acquire the lock
// language=lua
export const acquireWithFifoScript = `
-- Read (and define) provided values
local lockKey, lockValue = KEYS[1], KEYS[2]
local lastIdKey, timeout, id = ARGV[1], ARGV[2], ARGV[3]

local lastId, currentLockValue = redis.call('GET', lastIdKey), redis.call('GET', lockKey)

if lastId == nil or lastId == "" or lastId == false then
    lastId = "0"
end

if currentLockValue == false and tonumber(id) == tonumber(lastId) + 1 then
  redis.call("SET", lockKey, lockValue)

  -- If expire value is provided, set it
  if timeout ~= nil and timeout ~= false and timeout ~= "" then redis.call("PEXPIRE", lockKey, timeout) end

  return "OK"
end

return nil
`;

/*
 * Release the lock only if it has the same lockValue as acquireLock sets it.
 * This will prevent the release of an already released lock.
 *
 * Script source: https://redis.io/commands/set#patterns - Redis official docs
 */
// language=lua
export const releaseScript = `
for i, key in ipairs(KEYS) do
    if i % 2 == 1 and redis.call("GET", key) then
      redis.call("DEL", key)
    end
end

return "OK"
`;

// Same script as without FIFO but increments the last out ID
// language=lua
export const releaseWithFifoScript = `
local lockKey, lockValue = KEYS[1], KEYS[2]
local lastOutIdKey = ARGV[1]

redis.call("INCR", lastOutIdKey)

if redis.call("GET", lockKey) == lockValue
then
    return redis.call("DEL", lockKey)
else
    return 0
end
`;
