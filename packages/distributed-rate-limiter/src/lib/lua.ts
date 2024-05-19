export interface LuaScript {
    /**
     * The source code of the script to run. This is a template string containing a Lua script.
     */
    source: string;
    /**
     * The Redis compatible sha1 hash of the script.
     */
    hash?: string;
}

/**
 * Lua script to be passed into Redis to ensure that the rate limit is being followed.
 */
//language=lua
export const limitScript: string = `
-- The set containing the non-expired keys for this limiter.
local limiterPrefix = KEYS[1]
local max = KEYS[2]
local window = KEYS[3]
local limitedValue = KEYS[4]

local count = 0
local cursor = "0"

local pattern = limiterPrefix .. ":*"

repeat
  local result = redis.call('SCAN', cursor, 'MATCH', pattern)
  cursor = result[1]
  count = count + #result[2]
until cursor == "0"

local key = limiterPrefix .. ":" .. limitedValue

if count < tonumber(max) then
    redis.call("SET", key, limitedValue)
    redis.call("PEXPIRE", key, window)

    return "OK"
end

return "LIMITED"
` as const;
