import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { DataImportService } from './data-import.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'researcher')
export class DataImportController {
    constructor(private readonly importService: DataImportService) { }

    @Post('patient')
    async importPatient(@Body() patientData: any) {
        return this.importService.importPatient(patientData);
    }

    @Post('bulk')
    async importBulkPatients(@Body() data: { patients: any[] }) {
        return this.importService.importBulkPatients(data.patients);
    }

    @Post('assign')
    async assignCases(@Body() data: { patientId: string; clinicianIds: string[] }) {
        const count = await this.importService.assignImportedCases(
            data.patientId,
            data.clinicianIds
        );
        return { assignmentsCreated: count };
    }

    @Get('stats')
    async getStats() {
        return this.importService.getImportStats();
    }

    @Post('clear')
    async clearData() {
        await this.importService.clearAllData();
        return { message: 'All data cleared successfully' };
    }
}
