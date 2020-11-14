import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductGateway } from './product.gateway';

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService, ProductGateway],
})
export class AppModule {}
