import { getPoolToken } from '@bull-queue-standalone-app-demo/nest-worker-threads';
import { providerPrefix } from './tokens';

describe('tokens', () => {
    it('should create the getPoolToken correctly', () => {
        expect(getPoolToken('something')).toBe(
            `${providerPrefix}-something-pool`
        );
    });
});
