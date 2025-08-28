"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    server;
    logger = new common_1.Logger(NotificationsGateway_1.name);
    connectedClients = 0;
    handleConnection(client) {
        this.connectedClients++;
        this.logger.log(`WebSocket client connected: ${client.id} (Total: ${this.connectedClients})`);
        client.emit('connection_ack', {
            status: 'CONNECTED',
            timestamp: new Date().toISOString(),
        });
    }
    handleDisconnect(client) {
        this.connectedClients = Math.max(0, this.connectedClients - 1);
        this.logger.log(`WebSocket client disconnected: ${client.id} (Remaining: ${this.connectedClients})`);
    }
    handleSubscribeTelemetry(client) {
        client.join('telemetry_room');
        return { status: 'SUBSCRIBED_TO_TELEMETRY' };
    }
    broadcastNewTransaction(transaction) {
        if (this.server) {
            this.server.emit('transaction:new', transaction);
        }
    }
    broadcastFraudAlert(alert) {
        if (this.server) {
            this.server.emit('fraud:alert', alert);
        }
    }
    broadcastNotification(notification) {
        if (this.server) {
            this.server.emit('notification:new', notification);
        }
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_telemetry'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleSubscribeTelemetry", null);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        path: '/socket.io',
    })
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map