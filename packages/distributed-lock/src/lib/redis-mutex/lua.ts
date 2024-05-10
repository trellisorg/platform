/** Source: {@link https://github.com/AmrSaber/simple-redis-mutex/blob/master/src/lua.js} */

export const checkLockScript = `
local lockKey = KEYS[1]

local lockValue = redis.call('GET', lockKey)

if not lockValue then
    return "AVAILABLE"
end

return "LOCKED"
`;

// Check if the lock key is empty, set it with the provided value and timeout (if provided)
// Otherwise will do nothing (because of NX option) and return nil
export const acquireScript = `
local lockKey = KEYS[1]
local lockValue, timeout = ARGV[1], ARGV[2]

if timeout ~= nil and timeout ~= false and timeout ~= "" then
  return redis.call("SET", lockKey, lockValue, "NX", "PX", timeout)
end

return redis.call("SET", lockKey, lockValue, "NX")
`;

// Same as acquire + check that the provided id is the next id to acquire the lock
export const acquireWithFifoScript = `
-- Read (and define) provided values
local lockKey, lastIdKey = KEYS[1], KEYS[2]
local lockValue, timeout, id = ARGV[1], ARGV[2], ARGV[3]

local lastId, currentLockValue = redis.call('GET', lastIdKey), redis.call('GET', lockKey)

if lastId == nil or lastId == "" or lastId == false then lastId = "0" end

if tonumber(id) == tonumber(lastId) + 1 and currentLockValue == false then
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
export const releaseScript = `
local lockKey = KEYS[1]
local lockValue = ARGV[1]

if redis.call("GET", lockKey) == lockValue
then
    return redis.call("DEL", lockKey)
else
    return 0
end
`;

// Same script as without FIFO but increments the last out ID
export const releaseWithFifoScript = `
local lockKey, lastOutIdKey = KEYS[1], KEYS[2]
local lockValue = ARGV[1]

redis.call("INCR", lastOutIdKey)

if redis.call("GET", lockKey) == lockValue
then
    return redis.call("DEL", lockKey)
else
    return 0
end
`;
