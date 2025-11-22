import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Case } from '../cases/case.entity';
import { ClinicianResponse } from '../responses/clinician-response.entity';
import { User } from '../users/user.entity';
import { CaseAssignment } from '../assignments/case-assignment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Case, ClinicianResponse, User, CaseAssignment])
    ],
    providers: [AnalyticsService],
    controllers: [AnalyticsController],
    exports: [AnalyticsService]
})
export class AnalyticsModule { }
