import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StoryGateway } from './story.gateway';

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService, StoryGateway],
})
export class AppModule {}
