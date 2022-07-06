import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getData() {
        return this.appService.getResultFromWorker();
    }

    @Get('timeout')
    getDataTimeout() {
        return this.appService.getResultFromWorkerWithTimeout();
    }
}
