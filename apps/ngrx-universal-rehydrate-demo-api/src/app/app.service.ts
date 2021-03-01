import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    data = new Array(100).fill(null).map(() => ({
        title: Date.now().toString(),
        description: Date.now().toString(),
    }));

    getData() {
        return this.data;
    }
}
