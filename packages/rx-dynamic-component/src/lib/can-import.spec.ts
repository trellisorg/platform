import { Injectable, Injector } from '@angular/core';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import type { SpyObject } from '@ngneat/spectator/jest';
import { createSpyObject } from '@ngneat/spectator/jest';
import type { DynamicComponentManifest } from '@trellisorg/rx-dynamic-component';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import type { CanImport } from './can-import';
import { isCanImport, runCanImports } from './can-import';

let result: Observable<boolean> | Promise<boolean> | boolean;

@Injectable()
export class MockCanImport implements CanImport {
    canImport(
        manifest: DynamicComponentManifest
    ): Observable<boolean> | Promise<boolean> | boolean {
        return result;
    }
}

@Injectable()
export class RandomClass {}

describe('CanImport', () => {
    describe('isCanImport', () => {
        it('should be a CanImport', () => {
            expect(isCanImport(new MockCanImport())).toBe(true);
        });

        it('should not be a CanImport', () => {
            expect(isCanImport(new RandomClass() as any)).toBe(false);
        });
    });

    describe('runCanImports', () => {
        let injector: SpyObject<Injector>;

        const manifest: DynamicComponentManifest = {
            loadChildren: () => Promise.resolve(),
            componentId: '',
        };

        beforeEach(() => {
            injector = createSpyObject(Injector, { get: jest.fn() });
        });

        it('should be true with no guards', () => {
            expect(
                subscribeSpyTo(
                    runCanImports(injector, manifest, [])
                ).getFirstValue()
            ).toEqual(true);
        });

        it('should be true with no valid guards', () => {
            injector.get.mockReturnValue(new RandomClass());

            expect(
                subscribeSpyTo(
                    runCanImports(injector, manifest, [RandomClass as any])
                ).getFirstValue()
            ).toEqual(true);
        });

        it('should be true with one true observable', async () => {
            const canImport = new MockCanImport();

            jest.spyOn(canImport, 'canImport').mockReturnValue(of(true));

            injector.get.mockReturnValue(canImport);

            const subscriberSpy = subscribeSpyTo(
                runCanImports(injector, manifest, [MockCanImport])
            );

            await subscriberSpy.onComplete();

            expect(subscriberSpy.getLastValue()).toEqual(true);
        });

        it('should be true with one true observable and one true promise', async () => {
            const canImport1 = new MockCanImport();

            const canImport2 = new MockCanImport();

            jest.spyOn(canImport1, 'canImport').mockReturnValue(of(true));
            jest.spyOn(canImport2, 'canImport').mockReturnValue(
                Promise.resolve(true)
            );

            injector.get
                .mockReturnValueOnce(canImport1)
                .mockReturnValueOnce(canImport2);

            const subscriberSpy = subscribeSpyTo(
                runCanImports(injector, manifest, [
                    MockCanImport,
                    MockCanImport,
                ])
            );

            await subscriberSpy.onComplete();

            expect(subscriberSpy.getLastValue()).toEqual(true);
        });

        it('should be true with one true observable and one true promise and one true', async () => {
            const canImport1 = new MockCanImport();

            const canImport2 = new MockCanImport();

            const canImport3 = new MockCanImport();

            jest.spyOn(canImport1, 'canImport').mockReturnValue(of(true));
            jest.spyOn(canImport2, 'canImport').mockReturnValue(
                Promise.resolve(true)
            );
            jest.spyOn(canImport3, 'canImport').mockReturnValue(true);

            injector.get
                .mockReturnValueOnce(canImport1)
                .mockReturnValueOnce(canImport2)
                .mockReturnValueOnce(canImport3);

            const subscriberSpy = subscribeSpyTo(
                runCanImports(injector, manifest, [
                    MockCanImport,
                    MockCanImport,
                    MockCanImport,
                ])
            );

            await subscriberSpy.onComplete();

            expect(subscriberSpy.getLastValue()).toEqual(true);
        });

        it('should be false if any are false', async () => {
            const canImport1 = new MockCanImport();

            const canImport2 = new MockCanImport();

            const canImport3 = new MockCanImport();

            jest.spyOn(canImport1, 'canImport').mockReturnValue(of(true));
            jest.spyOn(canImport2, 'canImport').mockReturnValue(
                Promise.resolve(true)
            );
            jest.spyOn(canImport3, 'canImport').mockReturnValue(false);

            injector.get
                .mockReturnValueOnce(canImport1)
                .mockReturnValueOnce(canImport2)
                .mockReturnValueOnce(canImport3);

            const subscriberSpy = subscribeSpyTo(
                runCanImports(injector, manifest, [
                    MockCanImport,
                    MockCanImport,
                    MockCanImport,
                ])
            );

            await subscriberSpy.onComplete();

            expect(subscriberSpy.getLastValue()).toEqual(false);
        });
    });
});
