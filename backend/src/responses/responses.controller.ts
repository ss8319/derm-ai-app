import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponsesService } from './responses.service';
import { CreateClinicianResponseDto } from './create-clinician-response.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Responses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('responses')
export class ResponsesController {
    constructor(private readonly responsesService: ResponsesService) { }

    @Post()
    async create(@Body() dto: CreateClinicianResponseDto, @Request() req) {
        const userId = req.user.userId; // set by JwtStrategy
        return this.responsesService.create(dto, userId);
    }

    @Get('case/:caseId')
    async getByCase(@Param('caseId') caseId: string) {
        return this.responsesService.findByCase(caseId);
    }

    @Get('user')
    async getByUser(@Request() req) {
        const userId = req.user.userId;
        return this.responsesService.findByUser(userId);
    }
}
