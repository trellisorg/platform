import { Channel, Notification } from '@trellisorg/nest-pg-notify';

@Channel({ name: 'my_subscription' })
export class MySubscriptionChannel {
    @Notification({
        type: 'userChanged',
        eventIdKey: (payload) => payload.eventId,
        notificationProcessedExpiry: 10_000,
    })
    process(payload: any) {
        console.log('The payload', payload);
    }
}
