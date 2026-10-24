
import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service.js';

@Injectable()
export class DashboardService {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  async getAdminOverview() {
    return this.analyticsService.getOverview();
  }
}
