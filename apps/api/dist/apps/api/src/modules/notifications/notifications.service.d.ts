import { MockDbService } from '../../database/mock-db.service';
import { NotificationsGateway } from './notifications.gateway';
import { INotification, NotificationType } from "@finpay360/shared-types";
export declare class NotificationsService {
    private readonly mockDb;
    private readonly gateway;
    private readonly logger;
    constructor(mockDb: MockDbService, gateway: NotificationsGateway);
    findAll(userId?: string): {
        notifications: INotification[];
        unreadCount: number;
    };
    markAsRead(id: string): INotification | undefined;
    markAllAsRead(): {
        success: boolean;
    };
    dispatch(params: {
        type: NotificationType;
        title: string;
        message: string;
        severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
        userId?: string;
    }): INotification;
}
