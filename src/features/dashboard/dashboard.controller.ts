import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';
import { UserRole } from '../entities/user.entity.js';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}


  @Get('admin/overview')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminOverview() {
    return this.dashboardService.getAdminOverview();
  }
}