import { nestWorkerThreads } from './nest-worker-threads';

describe('nestWorkerThreads', () => {
    it('should work', () => {
        expect(nestWorkerThreads()).toEqual('nest-worker-threads');
    });
});
