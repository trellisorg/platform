import { PROCESSED_NOTIFICATION_PREFIX } from '../pg-notify.constants';

export function createProcessedNotificationKey(eventId: string): string {
    return `${PROCESSED_NOTIFICATION_PREFIX}:${eventId}`;
}
