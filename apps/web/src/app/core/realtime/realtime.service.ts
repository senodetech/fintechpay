import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { ITransaction, IFraudAlert, INotification } from '@finpay360/shared-types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RealtimeService {
  private socket: Socket | null = null;

  public isConnected = signal(false);
  public liveTransactionsCount = signal(0);
  public liveAlertsCount = signal(0);

  private transaction$ = new Subject<ITransaction>();
  private fraudAlert$ = new Subject<IFraudAlert>();
  private notification$ = new Subject<INotification>();

  constructor() {
    this.initSocket();
  }

  private initSocket(): void {
    try {
      this.socket = io(environment.wsUrl, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
      });

      this.socket.on('connect', () => {
        this.isConnected.set(true);
        this.socket?.emit('subscribe_telemetry');
      });

      this.socket.on('disconnect', () => {
        this.isConnected.set(false);
      });

      this.socket.on('transaction:new', (data: ITransaction) => {
        this.liveTransactionsCount.update((c) => c + 1);
        this.transaction$.next(data);
      });

      this.socket.on('fraud:alert', (data: IFraudAlert) => {
        this.liveAlertsCount.update((c) => c + 1);
        this.fraudAlert$.next(data);
      });

      this.socket.on('notification:new', (data: INotification) => {
        this.notification$.next(data);
      });
    } catch {
      this.isConnected.set(false);
    }
  }

  public get onTransaction$(): Observable<ITransaction> {
    return this.transaction$.asObservable();
  }

  public get onFraudAlert$(): Observable<IFraudAlert> {
    return this.fraudAlert$.asObservable();
  }

  public get onNotification$(): Observable<INotification> {
    return this.notification$.asObservable();
  }
}
