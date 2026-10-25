
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';
import { UserRole } from '../entities/user.entity.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('admin/overview')
  @ApiOperation({
    summary: 'Get admin dashboard overview',
    description: 'Returns overview statistics for the admin dashboard. Accessible only to administrators.',
  })
  @ApiOkResponse({
    description: 'Admin dashboard overview retrieved successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user does not have administrator privileges.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminOverview() {
    return this.dashboardService.getAdminOverview();
  }
}
