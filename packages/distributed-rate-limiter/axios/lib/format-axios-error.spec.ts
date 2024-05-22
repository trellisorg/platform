import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { formatAxiosError } from './format-axios-error';

describe('formatAxiosError', () => {
    it('should hide authorization', () => {
        expect(
            formatAxiosError(
                new AxiosError<unknown, any>('error', '400', {
                    headers: new AxiosHeaders({
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        authorization: '123',
                        ['content-type']: 'application/json',
                        ['Custom-Key']: '321',
                    }),
                })
            ).config.headers
        ).toEqual(
            expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                authorization: '<hidden>',
                ['Custom-Key']: '321',
            })
        );
    });
});
