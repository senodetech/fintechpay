import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getMetrics(range?: 'today' | '7d' | '30d' | '90d'): import("@finpay360/shared-types").DashboardMetricsDto;
}
