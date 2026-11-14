
import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { ThrottlerGuard } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsDateRangeDto } from './dto/analytics-date-range.dto.js';

import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';
import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';
import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';

import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';
import { UserRole } from '../entities/user.entity.js';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post('posts/:postId/views')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Record a post view',
    description:
      'Records a view of a published post for the authenticated user.',
  })
  @ApiParam({
    name: 'postId',
    type: Number,
    description: 'ID of the post to record a view for',
    example: 1,
  })
  @ApiCreatedResponse({
    description: 'Post view recorded successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid post ID',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @ApiNotFoundResponse({
    description: 'Published post not found',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests',
  })
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  async recordVisit(
    @Param('postId', ParseIntPipe) postId: number,
    @RequestedUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.analyticsService.recordVisit(postId, user.id);
  }

  @Get('overview')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get analytics overview',
    description: 'Returns the overall analytics summary for administrators.',
  })
  @ApiOkResponse({
    description: 'Analytics overview retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can access this endpoint',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('posts/:postId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get statistics for a post',
    description:
      'Returns analytics for a specific post within the optional date range.',
  })
  @ApiParam({
    name: 'postId',
    type: Number,
    description: 'ID of the post',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Post statistics retrieved successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid post ID or date range',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can access this endpoint',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getPostStats(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: AnalyticsDateRangeDto,
  ) {
    return this.analyticsService.getPostStats(
      postId,
      query.startDate,
      query.endDate,
    );
  }

  @Get('posts/popular')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get popular posts',
    description:
      'Returns popular posts based on analytics for the optional date range.',
  })
  @ApiOkResponse({
    description: 'Popular posts retrieved successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid date range',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can access this endpoint',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getPopularPosts(@Query() query: AnalyticsDateRangeDto) {
    return this.analyticsService.getPopularPosts(
      query.startDate,
      query.endDate,
    );
  }

  @Get('views/daily')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get daily views',
    description:
      'Returns daily view statistics for the optional date range.',
  })
  @ApiOkResponse({
    description: 'Daily view statistics retrieved successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid date range',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can access this endpoint',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getDailyViews(@Query() query: AnalyticsDateRangeDto) {
    return this.analyticsService.getDailyViews(
      query.startDate,
      query.endDate,
    );
  }
}
