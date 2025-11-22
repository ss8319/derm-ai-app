import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseAssignment } from './case-assignment.entity';

@Injectable()
export class AssignmentsService {
    constructor(
        @InjectRepository(CaseAssignment)
        private assignmentsRepository: Repository<CaseAssignment>,
    ) { }

    async assignCaseToUsers(caseId: string, userIds: string[]): Promise<CaseAssignment[]> {
        const assignments = userIds.map(userId =>
            this.assignmentsRepository.create({
                caseId,
                userId,
                status: 'pending',
            })
        );
        return this.assignmentsRepository.save(assignments);
    }

    async getAssignedCases(userId: string): Promise<CaseAssignment[]> {
        return this.assignmentsRepository.find({
            where: { userId },
            relations: ['case'],
            order: { assignedAt: 'DESC' },
        });
    }

    async getAllAssignments(): Promise<CaseAssignment[]> {
        return this.assignmentsRepository.find({
            relations: ['case', 'user'],
            order: { assignedAt: 'DESC' },
        });
    }

    async markAsCompleted(caseId: string, userId: string): Promise<void> {
        await this.assignmentsRepository.update(
            { caseId, userId },
            {
                status: 'completed',
                completedAt: new Date(),
            }
        );
    }

    async getAssignmentsByCaseId(caseId: string): Promise<CaseAssignment[]> {
        return this.assignmentsRepository.find({
            where: { caseId },
            relations: ['user'],
        });
    }
}
