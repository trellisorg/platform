import { SetMetadata } from '@nestjs/common';
import { PG_NOTIFY_CHANNEL } from '../pg-notify.constants';
import type { PgChannelOptions } from '../pg-notify.types';

export function Channel(options: PgChannelOptions): ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (target: Function) => {
        SetMetadata(PG_NOTIFY_CHANNEL, options)(target);
    };
}
