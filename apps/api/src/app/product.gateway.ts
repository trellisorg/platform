import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway(80, { namespace: 'product' })
export class ProductGateway implements OnGatewayConnection {
  handleConnection(client: any, ...args): any {
    console.log('Connected');
  }

  @SubscribeMessage('ngrx-data-websocket/save/add-one')
  addOne(@MessageBody() body, @ConnectedSocket() client: Socket) {
    setTimeout(
      () =>
        client.emit('ngrx-data-websocket/save/add-one/success', {
          data: { name: 'Hello New Name Here', id: body.data.id },
        }),
      5000
    );

    return {
      event: 'ngrx-data-websocket/save/add-one/success',
      data: body,
    };
  }
}
