import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private connectedClients;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribeTelemetry(client: Socket): {
        status: string;
    };
    broadcastNewTransaction(transaction: any): void;
    broadcastFraudAlert(alert: any): void;
    broadcastNotification(notification: any): void;
}
