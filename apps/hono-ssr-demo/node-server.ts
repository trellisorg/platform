import { serve } from '@trellisorg/ngx-hono-ssr/node';
import bootstrap from './src/main.server';

const PORT = 4000;

serve({ bootstrap, port: PORT });

console.log(`Node server listening at: http://localhost:${PORT}`);
