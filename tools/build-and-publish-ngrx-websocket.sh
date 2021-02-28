yarn nx build ngrx-data-websocket-client --prod
yarn nx build ngrx-data-websocket-core --prod
yarn nx build ngrx-data-websocket-server --prod

npm publish dist/packages/ngrx-data-websocket/client
npm publish dist/packages/ngrx-data-websocket/core
npm publish dist/packages/ngrx-data-websocket/server
