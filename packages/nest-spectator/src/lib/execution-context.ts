import type { ExecutionContext } from '@nestjs/common';
import type {
    HttpArgumentsHost,
    Type,
    WsArgumentsHost,
} from '@nestjs/common/interfaces';
import type { RpcArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { createSpyObject, SpyObject } from './mock';

/**
 * These classes are part of the private API and should not be used
 * they are only used internally to create spy objects
 */
class MockHttpArgumentsHost implements HttpArgumentsHost {
    getRequest<T = any>(): T {
        return;
    }

    getResponse<T = any>(): T {
        return;
    }

    getNext<T = any>(): T {
        return;
    }
}

class MockWsArgumentHost implements WsArgumentsHost {
    getData<T = any>(): T {
        return;
    }
    getClient<T = any>(): T {
        return;
    }
}

class MockRpcArgumentHost implements RpcArgumentsHost {
    getData<T = any>(): T {
        return;
    }
    getContext<T = any>(): T {
        return;
    }
}

class MockExecutionContext implements ExecutionContext {
    getClass<T = any>(): Type<T> {
        return;
    }

    getHandler(): Function {
        return () => {};
    }

    getArgs(): any {
        return;
    }

    getArgByIndex<T = any>(index: number): T {
        return;
    }

    switchToHttp(): HttpArgumentsHost {
        return mockHttpArgumentsHost();
    }

    switchToWs(): WsArgumentsHost {
        return mockWsArgumentHost();
    }

    switchToRpc(): RpcArgumentsHost {
        return mockRpcArgumentsHost();
    }

    getType(): any {
        return;
    }
}

export function mockHttpArgumentsHost(
    host?: Partial<HttpArgumentsHost>
): SpyObject<HttpArgumentsHost> {
    return createSpyObject(MockHttpArgumentsHost, host);
}

export function mockWsArgumentHost(
    host?: Partial<WsArgumentsHost>
): SpyObject<WsArgumentsHost> {
    return createSpyObject(MockWsArgumentHost, host);
}

export function mockRpcArgumentsHost(
    host?: Partial<RpcArgumentsHost>
): SpyObject<RpcArgumentsHost> {
    return createSpyObject(MockRpcArgumentHost, host);
}

export function mockExecutionContext(
    context?: Partial<ExecutionContext>
): SpyObject<ExecutionContext> {
    return createSpyObject(MockExecutionContext, context);
}
