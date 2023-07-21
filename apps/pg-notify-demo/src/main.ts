/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Client } from 'pg';
import { AppModule } from './app/app.module';

const client = new Client({
    connectionString: `postgresql://trellis-developer:local@localhost:5432/source?schema=public`,
});

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);

    await client.connect();

    // console.log(await client.query('LISTEN my_subscription'));

    // const subscriber = createSubscriber({});
    // await subscriber.connect();
    // await subscriber.listenTo('my_chanel');
    // subscriber.notifications.on('my_chanel', (payload) => {
    //     Payload as passed to subscriber.notify() (see below)
    // console.log("Received notification in 'my_subscription':", payload);
    // });

    // client.on('notification', (notification) => {
    //     console.log('Received notification:', notification);
    //     Handle the notification data as needed
    // });

    // client.on('end', console.log);
    // client.on('error', console.log);
    // client.on('notice', console.log);
    // client.on('drain', console.log);
}

bootstrap();
