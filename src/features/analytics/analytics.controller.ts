
import { Controller, Param, ParseIntPipe, Post,Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';
import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';
import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('analytics')
export class AnalyticsController {
      constructor(
        private readonly analyticsService: AnalyticsService,
    ) {}


   @Post('posts/:postId/views')
    @UseGuards(JwtAuthGuard,ThrottlerGuard)
    async recordVisit(
        @Param('postId', ParseIntPipe) postId: number,
        @RequestedUser() user: AuthenticatedUser,
    ): Promise<void> {
        await this.analyticsService.recordVisit(postId, user.id);
    }

    
    @Get('overview')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    getOverview() {
        return this.analyticsService.getOverview();
    }

    
    @Get('posts/:postId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    getPostStats(
    @Param('postId', ParseIntPipe) postId: number,
    ) {
    return this.analyticsService.getPostStats(postId);
    }

    @Get('posts/popular')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    getPopularPosts() {
        return this.analyticsService.getPopularPosts();
    }

    @Get('views/daily')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    getDailyViews() {
        return this.analyticsService.getDailyViews();
    }


}
