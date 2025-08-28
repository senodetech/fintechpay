import { Injectable, Logger } from '@nestjs/common';
import { MockDbService } from '../../database/mock-db.service';
import { NotificationsGateway } from './notifications.gateway';
import { INotification, NotificationType } from '@finpay360/shared-types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mockDb: MockDbService,
    private readonly gateway: NotificationsGateway,
  ) {}

  public findAll(userId?: string): { notifications: INotification[]; unreadCount: number } {
    const list = this.mockDb.notifications;
    const unreadCount = list.filter((n) => !n.isRead).length;
    return {
      notifications: list,
      unreadCount,
    };
  }

  public markAsRead(id: string): INotification | undefined {
    const notif = this.mockDb.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
    }
    return notif;
  }

  public markAllAsRead(): { success: boolean } {
    for (const n of this.mockDb.notifications) {
      n.isRead = true;
    }
    return { success: true };
  }

  public dispatch(params: {
    type: NotificationType;
    title: string;
    message: string;
    severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
    userId?: string;
  }): INotification {
    const notif: INotification = {
      id: `notif-${Date.now()}`,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      severity: params.severity || 'INFO',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.mockDb.notifications.unshift(notif);
    this.gateway.broadcastNotification(notif);
    return notif;
  }
}
