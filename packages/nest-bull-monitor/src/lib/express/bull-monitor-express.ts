import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { Router } from 'express';
import type { Server as HttpServer } from 'node:http';
import { BullMonitor } from '../main';

export type InitParams = {
    disableBodyParser?: boolean;
    httpServer?: HttpServer;
};

export class BullMonitorExpress extends BullMonitor<ApolloServer, any> {
    router?: Router;

    async init({ httpServer }: InitParams = {}) {
        const router = Router();

        router.get('/', (_req, res) => {
            res.type('html');
            res.send(this.renderUi());
        });

        this.createServer(ApolloServer, httpServer && [ApolloServerPluginDrainHttpServer({ httpServer })]);

        if (!this.server) {
            throw new Error(`Server was not created correctly.`);
        }

        await this.startServer();

        router.use(
            '/',
            expressMiddleware(this.server, {
                context: async () => ({
                    dataSources: this.dataSources(),
                }),
            })
        );

        this.router = router;
    }
}
