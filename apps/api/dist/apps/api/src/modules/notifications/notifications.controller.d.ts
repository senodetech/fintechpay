import { NotificationsService } from './notifications.service';
import { IUser } from "@finpay360/shared-types";
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: IUser): {
        notifications: import("@finpay360/shared-types").INotification[];
        unreadCount: number;
    };
    markAsRead(id: string): import("@finpay360/shared-types").INotification | undefined;
    markAllAsRead(): {
        success: boolean;
    };
}
