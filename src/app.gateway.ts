/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Initialized!');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('FromClient')
  handleMessage(client: Socket, text: string): void {
    this.logger.log('FromServer', text);
    this.wss.emit('FromServer', text);
  }

  @SubscribeMessage('ThereminiClient')
  handlePianoMessage(client: Socket, text: string): void {
    this.logger.log('ThereminiServer', text);
    this.wss.emit('ThereminiServer', text);
  }
}
