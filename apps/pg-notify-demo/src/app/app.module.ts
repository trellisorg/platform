import { Module } from '@nestjs/common';
import { PgNotifyModule } from '@trellisorg/nest-pg-notify';
import { MySubscriptionChannel } from './my-subscription.channel';

// Uncomment these if you want to "bring your own" instances.
// const ioredisClient = new Redis();
//
// const pg = createSubscriber({
//     connectionString: `postgresql://trellis-developer:local@localhost:5432/source?schema=public`,
// });
//
// pg.connect();

@Module({
    imports: [
        // Standard forRoot setup
        PgNotifyModule.forRoot({
            pg: {
                connectionConfig: {
                    connectionString: `postgresql://trellis-developer:local@localhost:5432/source?schema=public`,
                },
            },
            redlock: {
                settings: undefined,
                scripts: undefined,
            },
            ioredis: [],
        }),
        // Bring your own instance forRoot
        // PgNotifyModule.forRoot({
        //     pg,
        //     redlock: new Redlock([ioredisClient]),
        //     ioredis: ioredisClient,
        // }),
        // Async setup with support for pulling from DI.
        // PgNotifyModule.forRootAsync({
        //     useFactory: () => ({
        //         pg: {
        //             connectionConfig: {
        //                 connectionString: `postgresql://trellis-developer:local@localhost:5432/source?schema=public`,
        //             },
        //         },
        //         redlock: {
        //             settings: undefined,
        //             scripts: undefined,
        //         },
        //         ioredis: [],
        //     }),
        // }),
        PgNotifyModule.registerChannel({
            name: 'my_subscription',
        }),
    ],
    providers: [MySubscriptionChannel],
})
export class AppModule {}
