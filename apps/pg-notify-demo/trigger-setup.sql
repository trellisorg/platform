CREATE TABLE "User"
(
    name varchar,
    id varchar
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION notify_changes()
    RETURNS TRIGGER AS
$$
DECLARE
    notification_payload JSONB;
BEGIN
    notification_payload := jsonb_build_object(
        -- We will be sending ID here not name so we can go back and look up the records to update
        'data', NEW,
        -- Need some kind of Id to dedupe the notifications on our servers
        'eventId', gen_random_uuid(),
        'type', 'userChanged'
        );

    PERFORM pg_notify('my_subscription', notification_payload::TEXT);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER your_table_changes_trigger
    AFTER UPDATE OR INSERT
    ON "User"
    FOR EACH ROW
EXECUTE FUNCTION notify_changes();
