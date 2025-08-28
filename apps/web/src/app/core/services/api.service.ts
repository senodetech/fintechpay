import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  PaginatedResponse,
  DashboardMetricsDto,
  ICustomer,
  CreateCustomerDto,
  UpdateKycStatusDto,
  IAccount,
  CreateAccountDto,
  UpdateAccountStatusDto,
  IPayment,
  IPaymentEvent,
  CreatePaymentDto,
  RefundPaymentDto,
  CancelPaymentDto,
  PaymentFilterDto,
  ITransaction,
  ILedgerEntry,
  TransactionFilterDto,
  IFraudAlert,
  IFraudRule,
  FraudFilterDto,
  InvestigateFraudAlertDto,
  UpdateFraudRuleDto,
  IAuditLog,
  INotification,
} from '@finpay360/shared-types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // 1. Dashboard
  public getDashboardMetrics(range: 'today' | '7d' | '30d' | '90d' = '30d'): Observable<ApiResponse<DashboardMetricsDto>> {
    return this.http.get<ApiResponse<DashboardMetricsDto>>(`${this.baseUrl}/dashboard/metrics?range=${range}`);
  }

  // 2. Customers
  public getCustomers(params?: any): Observable<ApiResponse<PaginatedResponse<ICustomer>>> {
    return this.http.get<ApiResponse<PaginatedResponse<ICustomer>>>(`${this.baseUrl}/customers`, { params });
  }

  public getCustomerById(id: string): Observable<ApiResponse<{
    customer: ICustomer;
    accounts: IAccount[];
    payments: IPayment[];
    transactions: ITransaction[];
    fraudAlerts: IFraudAlert[];
  }>> {
    return this.http.get<any>(`${this.baseUrl}/customers/${id}`);
  }

  public createCustomer(dto: CreateCustomerDto): Observable<ApiResponse<ICustomer>> {
    return this.http.post<ApiResponse<ICustomer>>(`${this.baseUrl}/customers`, dto);
  }

  public updateKycStatus(id: string, dto: UpdateKycStatusDto): Observable<ApiResponse<ICustomer>> {
    return this.http.patch<ApiResponse<ICustomer>>(`${this.baseUrl}/customers/${id}/kyc`, dto);
  }

  // 3. Accounts
  public getAccounts(params?: any): Observable<ApiResponse<PaginatedResponse<IAccount>>> {
    return this.http.get<ApiResponse<PaginatedResponse<IAccount>>>(`${this.baseUrl}/accounts`, { params });
  }

  public getAccountById(id: string): Observable<ApiResponse<IAccount>> {
    return this.http.get<ApiResponse<IAccount>>(`${this.baseUrl}/accounts/${id}`);
  }

  public getAccountTransactions(id: string, params?: any): Observable<ApiResponse<PaginatedResponse<ITransaction>>> {
    return this.http.get<ApiResponse<PaginatedResponse<ITransaction>>>(`${this.baseUrl}/accounts/${id}/transactions`, { params });
  }

  public createAccount(dto: CreateAccountDto): Observable<ApiResponse<IAccount>> {
    return this.http.post<ApiResponse<IAccount>>(`${this.baseUrl}/accounts`, dto);
  }

  public updateAccountStatus(id: string, dto: UpdateAccountStatusDto): Observable<ApiResponse<IAccount>> {
    return this.http.patch<ApiResponse<IAccount>>(`${this.baseUrl}/accounts/${id}/status`, dto);
  }

  // 4. Payments
  public getPayments(filter?: PaymentFilterDto): Observable<ApiResponse<PaginatedResponse<IPayment>>> {
    return this.http.get<ApiResponse<PaginatedResponse<IPayment>>>(`${this.baseUrl}/payments`, { params: filter as any });
  }

  public getPaymentById(id: string): Observable<ApiResponse<{
    payment: IPayment;
    events: IPaymentEvent[];
    transactions: ITransaction[];
  }>> {
    return this.http.get<any>(`${this.baseUrl}/payments/${id}`);
  }

  public createPayment(dto: CreatePaymentDto): Observable<ApiResponse<IPayment>> {
    const headers = { 'Idempotency-Key': dto.idempotencyKey };
    return this.http.post<ApiResponse<IPayment>>(`${this.baseUrl}/payments`, dto, { headers });
  }

  public refundPayment(id: string, dto: RefundPaymentDto): Observable<ApiResponse<IPayment>> {
    return this.http.post<ApiResponse<IPayment>>(`${this.baseUrl}/payments/${id}/refund`, dto);
  }

  public cancelPayment(id: string, dto: CancelPaymentDto): Observable<ApiResponse<IPayment>> {
    return this.http.post<ApiResponse<IPayment>>(`${this.baseUrl}/payments/${id}/cancel`, dto);
  }

  // 5. Transactions
  public getTransactions(filter?: TransactionFilterDto): Observable<ApiResponse<PaginatedResponse<ITransaction>>> {
    return this.http.get<ApiResponse<PaginatedResponse<ITransaction>>>(`${this.baseUrl}/transactions`, { params: filter as any });
  }

  public getTransactionById(id: string): Observable<ApiResponse<{
    transaction: ITransaction;
    ledgerEntries: ILedgerEntry[];
  }>> {
    return this.http.get<any>(`${this.baseUrl}/transactions/${id}`);
  }

  // 6. Fraud & Risk
  public getFraudAlerts(filter?: FraudFilterDto): Observable<ApiResponse<PaginatedResponse<IFraudAlert>>> {
    return this.http.get<ApiResponse<PaginatedResponse<IFraudAlert>>>(`${this.baseUrl}/fraud/alerts`, { params: filter as any });
  }

  public getFraudAlertById(id: string): Observable<ApiResponse<{
    alert: IFraudAlert;
    customer?: ICustomer;
    payment?: IPayment;
  }>> {
    return this.http.get<any>(`${this.baseUrl}/fraud/alerts/${id}`);
  }

  public investigateAlert(id: string, dto: InvestigateFraudAlertDto): Observable<ApiResponse<IFraudAlert>> {
    return this.http.patch<ApiResponse<IFraudAlert>>(`${this.baseUrl}/fraud/alerts/${id}/investigate`, dto);
  }

  public getFraudRules(): Observable<ApiResponse<IFraudRule[]>> {
    return this.http.get<ApiResponse<IFraudRule[]>>(`${this.baseUrl}/fraud/rules`);
  }

  public updateFraudRule(id: string, dto: UpdateFraudRuleDto): Observable<ApiResponse<IFraudRule>> {
    return this.http.patch<ApiResponse<IFraudRule>>(`${this.baseUrl}/fraud/rules/${id}`, dto);
  }

  // 7. Audit Logs
  public getAuditLogs(params?: any): Observable<ApiResponse<PaginatedResponse<IAuditLog>>> {
    return this.http.get<ApiResponse<PaginatedResponse<IAuditLog>>>(`${this.baseUrl}/audit-logs`, { params });
  }

  // 8. Notifications
  public getNotifications(): Observable<ApiResponse<{ notifications: INotification[]; unreadCount: number }>> {
    return this.http.get<any>(`${this.baseUrl}/notifications`);
  }

  public markNotificationAsRead(id: string): Observable<ApiResponse<INotification>> {
    return this.http.patch<ApiResponse<INotification>>(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  public markAllNotificationsAsRead(): Observable<ApiResponse<{ success: boolean }>> {
    return this.http.patch<ApiResponse<{ success: boolean }>>(`${this.baseUrl}/notifications/read-all`, {});
  }
}
