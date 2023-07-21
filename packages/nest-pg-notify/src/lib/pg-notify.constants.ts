export const PG_NOTIFY_CHANNEL = Symbol('pg-notify:channel');
export const PG_NOTIFY_NOTIFICATION = Symbol('pg-notify:notification');

export const PG_NOTIFY_CONFIG = Symbol('pg-notify:config');
export const PG_NOTIFY_SUBSCRIBER = Symbol('pg-notify:subscriber');

export const PG_NOTIFY_REDIS = Symbol('pg-notify:redis');
export const PG_NOTIFY_REDLOCK = Symbol('pg-notify:redlock');

export const PROCESSED_NOTIFICATION_PREFIX = 'pg-notify:notification' as const;
