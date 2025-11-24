import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    @Get('my-cases')
    async getMyAssignedCases(@Request() req) {
        const assignments = await this.assignmentsService.getAssignedCases(req.user.id);
        // Deduplicate cases by ID to prevent frontend errors
        const uniqueCases = new Map();
        assignments.forEach(a => {
            if (a.case) uniqueCases.set(a.case.id, a.case);
        });
        return Array.from(uniqueCases.values());
    }

    @Post()
    @Roles('admin', 'researcher')
    async assignCase(@Body() body: { caseId: string; userIds: string[] }) {
        return this.assignmentsService.assignCaseToUsers(body.caseId, body.userIds);
    }

    @Get()
    @Roles('admin', 'researcher')
    async getAllAssignments() {
        return this.assignmentsService.getAllAssignments();
    }
}
