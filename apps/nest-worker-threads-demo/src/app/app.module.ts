import { Module } from '@nestjs/common';

import { NestWorkerThreadModule } from '@trellisorg/nest-worker-threads';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        NestWorkerThreadModule.forRoot({
            pools: [
                {
                    id: 'hello',
                    options: { task: join(__dirname, 'worker.js'), size: 2 },
                },
            ],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
