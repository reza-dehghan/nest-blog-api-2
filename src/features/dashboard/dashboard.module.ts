
import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { AuthenticationModule } from '../../infra/authentication/authentication.module.js';

@Module({
  imports: [AnalyticsModule,AuthenticationModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
