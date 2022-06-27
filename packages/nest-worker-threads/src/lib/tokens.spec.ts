import { getPoolToken, providerPrefix } from './tokens';

describe('tokens', () => {
    it('should create the getPoolToken correctly', () => {
        expect(getPoolToken('something')).toBe(
            `${providerPrefix}-something-pool`
        );
    });
});
