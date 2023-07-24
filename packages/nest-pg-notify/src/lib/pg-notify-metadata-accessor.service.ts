import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PG_NOTIFY_CHANNEL, PG_NOTIFY_NOTIFICATION } from './pg-notify.constants';
import type { PgChannelOptions, PgNotificationOptions } from './pg-notify.types';

@Injectable()
export class PgNotifyMetadataAccessor {
    constructor(private readonly reflector: Reflector) {}

    // eslint-disable-next-line @typescript-eslint/ban-types
    isChannel(target: Type<unknown> | Function): boolean {
        if (!target) {
            return false;
        }

        return !!this.reflector.get(PG_NOTIFY_CHANNEL, target);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    isNotification(target: Type<unknown> | Function): boolean {
        if (!target) {
            return false;
        }

        return !!this.reflector.get(PG_NOTIFY_NOTIFICATION, target);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    getChannelMetadata(target: Type<unknown> | Function): PgChannelOptions {
        return this.reflector.get(PG_NOTIFY_CHANNEL, target);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    getNotificationMetadata(target: Type<unknown> | Function): PgNotificationOptions {
        return this.reflector.get(PG_NOTIFY_NOTIFICATION, target);
    }
}
