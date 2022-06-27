import {
    getPoolToken,
    InjectPool,
} from '@bull-queue-standalone-app-demo/nest-worker-threads';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

const token = 'MockPool';

class MockPool {}

@Injectable()
class MockService {
    constructor(@InjectPool(token) public readonly mockPool: MockPool) {}
}

describe('InjectPool', () => {
    let service: MockService;

    const mockPool = new MockPool();

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: getPoolToken(token),
                    useValue: mockPool,
                },
                MockService,
            ],
        }).compile();

        service = await moduleRef.resolve(MockService);
    });

    it('should inject the mock pool', () => {
        expect(service.mockPool).toBe(mockPool);
    });
});
