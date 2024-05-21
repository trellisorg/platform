import { AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { generateCurlCommand } from './format-axios-error';

describe('generateCurlCommand', () => {
    it('format a POST with data', () => {
        expect(
            generateCurlCommand(
                {
                    method: 'POST',
                    url: '/search',
                    headers: new AxiosHeaders({
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Authorization: 'Bearer 123',
                        ['Content-Type']: 'application/json',
                        ['Custom-Key']: 'Key 123',
                    }),
                    data: {
                        property: '1',
                    },
                    baseUrl: 'https://google.com',
                    params: {
                        query: '1',
                    },
                },
                ['Authorization', 'Custom-Key'].map((v) => v.toLowerCase())
            )
        ).toEqual(
            `curl -X POST "https://google.com/search?query=1" -H 'Authorization:<hidden>' -H 'Content-Type:application/json' -H 'Custom-Key:<hidden>' --data '{"property":"1"}'`
        );
    });

    it('format a GET without data', () => {
        expect(
            generateCurlCommand(
                {
                    method: 'GET',
                    url: '/refresh/nxt',
                    headers: new AxiosHeaders({
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Authorization: '<hidden>',
                        ['Content-Type']: 'application/json',
                        ['Custom-Key']: '<hidden>',
                    }),
                    baseUrl: 'https://bb.nxt',
                    params: {
                        query: '1',
                    },
                },
                ['Authorization', 'Custom-Key'].map((v) => v.toLowerCase())
            )
        ).toEqual(
            `curl -X GET "https://bb.nxt/refresh/nxt?query=1" -H 'Authorization:<hidden>' -H 'Content-Type:application/json' -H 'Custom-Key:<hidden>'`
        );
    });
});
