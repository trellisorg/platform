import { serve } from '@trellisorg/ngx-hono-ssr/bun';
import bootstrap from './src/main.server';

const { app } = serve({ bootstrap });

export default {
    fetch: app.fetch,
    port: 4000,
};
