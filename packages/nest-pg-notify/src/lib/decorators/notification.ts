import { SetMetadata } from '@nestjs/common';
import { PG_NOTIFY_NOTIFICATION } from '../pg-notify.constants';
import type { PgNotificationOptions } from '../pg-notify.types';

export function Notification(options: PgNotificationOptions): MethodDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return SetMetadata(PG_NOTIFY_NOTIFICATION, options || {});
}
