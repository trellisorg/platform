import {
    mockHttpArgumentsHost,
    mockRpcArgumentsHost,
    mockWsArgumentHost,
} from './execution-context';

describe('ExecutionContext', () => {
    describe('mockHttpArgumentsHost', () => {
        describe('spy on functions', () => {
            it('mock getRequest', () => {
                const mock = mockHttpArgumentsHost();
                const val = {};
                mock.getRequest.mockReturnValue(val);

                expect(mock.getRequest()).toBe(val);
            });

            it('mock getResponse', () => {
                const mock = mockHttpArgumentsHost();
                const val = {};
                mock.getResponse.mockReturnValue(val);

                expect(mock.getResponse()).toBe(val);
            });

            it('mock getNext', () => {
                const mock = mockHttpArgumentsHost();
                const val = {};
                mock.getNext.mockReturnValue(val);

                expect(mock.getNext()).toBe(val);
            });
        });

        describe('provide implementation', () => {
            it('mock getRequest', () => {
                const val: any = {};
                const mock = mockHttpArgumentsHost({
                    getRequest<T = any>(): T {
                        return val;
                    },
                });

                expect(mock.getRequest()).toBe(val);
            });

            it('mock getResponse', () => {
                const val: any = {};
                const mock = mockHttpArgumentsHost({
                    getResponse<T = any>(): T {
                        return val;
                    },
                });

                expect(mock.getResponse()).toBe(val);
            });

            it('mock getNext', () => {
                const val: any = {};
                const mock = mockHttpArgumentsHost({
                    getNext<T = any>(): T {
                        return val;
                    },
                });

                expect(mock.getNext()).toBe(val);
            });
        });
    });

    describe('mockWsArgumentHost', () => {
        describe('spy on functions', () => {
            it('mock getRequest', () => {
                const mock = mockWsArgumentHost();
                const val = {};
                mock.getData.mockReturnValue(val);

                expect(mock.getData()).toBe(val);
            });

            it('mock getResponse', () => {
                const mock = mockWsArgumentHost();
                const val = {};
                mock.getClient.mockReturnValue(val);

                expect(mock.getClient()).toBe(val);
            });
        });

        describe('provide implementation', () => {
            it('mock getRequest', () => {
                const val: any = {};
                const mock = mockWsArgumentHost({
                    getData<T = any>(): T {
                        return val;
                    },
                });

                expect(mock.getData()).toBe(val);
            });

            it('mock getResponse', () => {
                const val: any = {};
                const mock = mockWsArgumentHost({
                    getClient<T = any>(): T {
                        return val;
                    },
                });

                expect(mock.getClient()).toBe(val);
            });
        });
    });

    describe('mockRpcArgumentsHost', () => {
        describe('spy on functions', () => {
            it('mock getRequest', () => {
                const mock = mockRpcArgumentsHost();
                const val = {};
                mock.getData.mockReturnValue(val);

                expect(mock.getData()).toBe(val);
            });

            it('mock getResponse', () => {
                const mock = mockRpcArgumentsHost();
                const val = {};
                mock.getContext.mockReturnValue(val);

                expect(mock.getContext()).toBe(val);
            });
        });

        describe('provide implementation', () => {
            it('mock getRequest', () => {
                const val: any = {};
                const mock = mockRpcArgumentsHost({
                    getData<T = any>(): T {
                        return val;
                    },
                });

                expect(mock.getData()).toBe(val);
            });

            it('mock getResponse', () => {
                const val: any = {};
                const mock = mockRpcArgumentsHost({
                    getContext<T = any>(): T {
                        return val;
                    },
                });

                expect(mock.getContext()).toBe(val);
            });
        });
    });
});
