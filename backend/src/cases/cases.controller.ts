import { Controller, Get, Param } from '@nestjs/common';
import { CasesService } from './cases.service';
import { Case } from './case.entity';

@Controller('cases')
export class CasesController {
    constructor(private readonly casesService: CasesService) { }

    @Get()
    async findAll(): Promise<Case[]> {
        return this.casesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Case | null> {
        return this.casesService.findOne(id);
    }

    @Get('patients/list')
    async getPatients() {
        return this.casesService.getPatients();
    }

    @Get('patients/:patientId/lesions')
    async getLesionsByPatient(@Param('patientId') patientId: string): Promise<Case[]> {
        return this.casesService.getLesionsByPatient(patientId);
    }
}
