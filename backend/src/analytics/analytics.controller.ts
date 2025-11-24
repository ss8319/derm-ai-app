import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analytics (Admin)')
@ApiBearerAuth()
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'researcher')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('overview')
    async getOverview() {
        return this.analyticsService.getOverviewMetrics();
    }

    @Get('clinicians')
    async getClinicianPerformance() {
        return this.analyticsService.getClinicianPerformance();
    }

    @Get('cases/:id')
    async getCaseAnalytics(@Param('id') id: string) {
        return this.analyticsService.getCaseAnalytics(id);
    }
}
