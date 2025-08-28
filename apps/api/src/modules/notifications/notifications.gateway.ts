import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/socket.io',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients: number = 0;

  handleConnection(client: Socket) {
    this.connectedClients++;
    this.logger.log(`WebSocket client connected: ${client.id} (Total: ${this.connectedClients})`);
    client.emit('connection_ack', {
      status: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients = Math.max(0, this.connectedClients - 1);
    this.logger.log(`WebSocket client disconnected: ${client.id} (Remaining: ${this.connectedClients})`);
  }

  @SubscribeMessage('subscribe_telemetry')
  handleSubscribeTelemetry(client: Socket) {
    client.join('telemetry_room');
    return { status: 'SUBSCRIBED_TO_TELEMETRY' };
  }

  public broadcastNewTransaction(transaction: any) {
    if (this.server) {
      this.server.emit('transaction:new', transaction);
    }
  }

  public broadcastFraudAlert(alert: any) {
    if (this.server) {
      this.server.emit('fraud:alert', alert);
    }
  }

  public broadcastNotification(notification: any) {
    if (this.server) {
      this.server.emit('notification:new', notification);
    }
  }
}
