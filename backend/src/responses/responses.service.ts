import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicianResponse } from './clinician-response.entity';
import { CreateClinicianResponseDto } from './create-clinician-response.dto';
import { AssignmentsService } from '../assignments/assignments.service';

@Injectable()
export class ResponsesService {
    constructor(
        @InjectRepository(ClinicianResponse)
        private responseRepo: Repository<ClinicianResponse>,
        private assignmentsService: AssignmentsService,
    ) { }

    async create(dto: CreateClinicianResponseDto, userId: string): Promise<ClinicianResponse> {
        const response = this.responseRepo.create({
            ...dto,
            userId,
        });
        const saved = await this.responseRepo.save(response);

        // Mark assignment as completed
        await this.assignmentsService.markAsCompleted(dto.caseId, userId);

        return saved;
    }

    async findByCase(caseId: string): Promise<ClinicianResponse[]> {
        return this.responseRepo.find({ where: { caseId } });
    }

    async findByUser(userId: string): Promise<ClinicianResponse[]> {
        return this.responseRepo.find({ where: { userId } });
    }

    async findAll(): Promise<ClinicianResponse[]> {
        return this.responseRepo.find({
            relations: ['case', 'user'],
            order: { createdAt: 'DESC' },
        });
    }
}

