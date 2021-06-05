import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import {
    SocketOp,
    SocketUpdateRequestPayload,
    SocketUpdateResponsePayload,
} from '@trellisorg/ngrx-data-websocket-core';
import type {
    SocketEntityGatewayBase,
    SocketEventBody,
    SocketEventReturn,
} from '@trellisorg/ngrx-data-websocket-server';
import type { Socket } from 'socket.io';
import * as SocketIO from 'socket.io';

export class Story {
    id: string;
    order: number;
    column: number;
    title: string;
}

@WebSocketGateway(80, { namespace: 'story' })
export class StoryGateway
    implements OnGatewayConnection, SocketEntityGatewayBase<Story> {
    @WebSocketServer() server: SocketIO.Server;

    initialData: Story[] = [
        { id: '1', order: 0, column: 0, title: 'Order 0 Column 0' },
        { id: '2', order: 1, column: 0, title: 'Order 1 Column 0' },
        { id: '3', order: 2, column: 0, title: 'Order 2 Column 0' },
        { id: '4', order: 0, column: 1, title: 'Order 0 Column 1' },
        { id: '5', order: 1, column: 1, title: 'Order 1 Column 1' },
        { id: '6', order: 2, column: 1, title: 'Order 2 Column 1' },
        { id: '7', order: 0, column: 2, title: 'Order 0 Column 2' },
        { id: '8', order: 1, column: 2, title: 'Order 1 Column 2' },
    ];

    handleConnection(socket: Socket, ...args): any {
        console.log('Connected');

        socket.join('stories');
    }

    @SubscribeMessage(SocketOp.QUERY_ALL)
    async queryAll(
        @MessageBody() body: SocketEventBody<void>,
        @ConnectedSocket() client: Socket
    ): Promise<SocketEventReturn<SocketOp.QUERY_ALL_SUCCESS, Story[]>> {
        return {
            event: SocketOp.QUERY_ALL_SUCCESS,
            data: {
                correlationId: body.correlationId,
                data: this.initialData,
            },
        };
    }

    @SubscribeMessage(SocketOp.SAVE_UPDATE_ONE)
    updateOne(
        @MessageBody() body: SocketEventBody<SocketUpdateRequestPayload<Story>>,
        @ConnectedSocket() client: Socket
    ): SocketEventReturn<
        SocketOp.SAVE_UPDATE_ONE_SUCCESS,
        SocketUpdateResponsePayload<Story>
    > {
        const index = this.initialData.findIndex(
            (item) => item.id === body.data.id
        );
        this.initialData[index] = {
            ...this.initialData[index],
            ...body.data.changes,
        };
        client
            .to('stories')
            .emit('ngrx-data-websocket/save/update-one/success', {
                data: {
                    id: this.initialData[index].id,
                    changes: this.initialData[index],
                    changed: false,
                },
            });

        return {
            event: SocketOp.SAVE_UPDATE_ONE_SUCCESS,
            data: {
                ...body,
                data: {
                    id: this.initialData[index].id,
                    changes: this.initialData[index],
                    changed: false,
                },
            },
        };
    }

    @SubscribeMessage(SocketOp.SAVE_ADD_ONE)
    addOne(
        @MessageBody() body: SocketEventBody<Story>,
        @ConnectedSocket() client: Socket
    ): SocketEventReturn<SocketOp.SAVE_ADD_ONE_SUCCESS, Story> {
        const story: Story = {
            ...body.data,
            id: (this.initialData.length + 1).toString(),
        };

        const data = {
            data: story,
        };

        client.to('stories').emit(SocketOp.SAVE_ADD_ONE_SUCCESS, data);

        return {
            event: SocketOp.SAVE_ADD_ONE_SUCCESS,
            data: {
                ...data,
                correlationId: body.correlationId,
            },
        };
    }

    @SubscribeMessage(SocketOp.QUERY_BY_KEY)
    queryByKey(
        @MessageBody() body: SocketEventBody<string | number>,
        @ConnectedSocket() client: SocketIO.Socket
    ): SocketEventReturn<SocketOp.QUERY_BY_KEY_SUCCESS, Story> {
        return {
            event: SocketOp.QUERY_BY_KEY_SUCCESS,
            data: {
                correlationId: body.correlationId,
                data: this.initialData.find((item) => item.id === body.data),
            },
        };
    }

    @SubscribeMessage(SocketOp.QUERY_MANY)
    queryMany(
        @MessageBody() body: SocketEventBody<Record<string, string>>,
        @ConnectedSocket() client: SocketIO.Socket
    ): SocketEventReturn<SocketOp.QUERY_MANY_SUCCESS, Story[]> {
        return {
            event: SocketOp.QUERY_MANY_SUCCESS,
            data: {
                correlationId: body.correlationId,
                data: this.initialData.filter((item) =>
                    Object.keys(body.data).some(
                        (key) => body.data[key] === item[key]
                    )
                ),
            },
        };
    }

    @SubscribeMessage(SocketOp.SAVE_ADD_MANY)
    saveAddMany(
        @MessageBody() body: SocketEventBody<Story[]>,
        @ConnectedSocket() client: SocketIO.Socket
    ): SocketEventReturn<SocketOp.SAVE_ADD_MANY_SUCCESS, Story[]> {
        this.initialData.push(...body.data);
        return {
            event: SocketOp.SAVE_ADD_MANY_SUCCESS,
            data: {
                correlationId: body.correlationId,
                data: body.data,
            },
        };
    }

    @SubscribeMessage(SocketOp.SAVE_UPSERT_ONE)
    upsertOne(
        @MessageBody() body: SocketEventBody<Story>,
        @ConnectedSocket() client: SocketIO.Socket
    ): SocketEventReturn<SocketOp.SAVE_UPSERT_ONE_SUCCESS, Story> {
        const index = this.initialData.findIndex(
            (item) => item.id === body.data.id
        );

        if (index === -1) {
            this.initialData.push(body.data);
        } else {
            this.initialData[index] = body.data;
        }
        return {
            event: SocketOp.SAVE_UPSERT_ONE_SUCCESS,
            data: {
                correlationId: body.correlationId,
                data: body.data,
            },
        };
    }

    @SubscribeMessage(SocketOp.SAVE_DELETE_ONE)
    deleteOne(
        @MessageBody() body: SocketEventBody<string | number>,
        @ConnectedSocket() client: SocketIO.Socket
    ): SocketEventReturn<SocketOp.SAVE_DELETE_ONE_SUCCESS, string | number> {
        this.initialData = this.initialData.filter(
            (story) => story.id !== body.data
        );

        client
            .to('stories')
            .emit(SocketOp.SAVE_DELETE_ONE_SUCCESS, { data: body.data });

        return {
            event: SocketOp.SAVE_DELETE_ONE_SUCCESS,
            data: {
                correlationId: body.correlationId,
                data: body.data,
            },
        };
    }
}
