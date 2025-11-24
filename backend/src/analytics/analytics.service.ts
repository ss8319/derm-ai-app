import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from '../cases/case.entity';
import { ClinicianResponse } from '../responses/clinician-response.entity';
import { User } from '../users/user.entity';
import { CaseAssignment } from '../assignments/case-assignment.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(Case)
        private caseRepo: Repository<Case>,
        @InjectRepository(ClinicianResponse)
        private responseRepo: Repository<ClinicianResponse>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(CaseAssignment)
        private assignmentRepo: Repository<CaseAssignment>,
    ) { }

    async getOverviewMetrics() {
        const totalCases = await this.caseRepo.count();
        const totalClinicians = await this.userRepo.count({ where: { role: 'clinician' } });
        const totalResponses = await this.responseRepo.count();

        const totalAssignments = await this.assignmentRepo.count();
        const completedAssignments = await this.assignmentRepo.count({ where: { status: 'completed' } });

        const completionRate = totalAssignments > 0
            ? (completedAssignments / totalAssignments)
            : 0;

        // Calculate overall accuracy (simple string match for MVP)
        // In a real app, this would be more sophisticated
        const responses = await this.responseRepo.find({ relations: ['case'] });
        let correctCount = 0;

        responses.forEach(r => {
            if (r.case && r.diagnosis.toLowerCase().includes(r.case.groundTruthDiagnosis.toLowerCase())) {
                correctCount++;
            }
        });

        const accuracyRate = responses.length > 0
            ? (correctCount / responses.length)
            : 0;

        return {
            totalCases,
            totalClinicians,
            totalResponses,
            completionRate,
            accuracyRate,
            totalAssignments,
            completedAssignments
        };
    }

    async getCaseAnalytics(caseId: string) {
        const caseData = await this.caseRepo.findOne({ where: { id: caseId } });
        if (!caseData) return null;

        const responses = await this.responseRepo.find({
            where: { caseId },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });

        const assignments = await this.assignmentRepo.find({
            where: { caseId },
            relations: ['user']
        });

        // Calculate accuracy for this case
        const processedResponses = responses.map(r => {
            const isCorrect = r.diagnosis.toLowerCase().includes(caseData.groundTruthDiagnosis.toLowerCase());
            return {
                ...r,
                isCorrect
            };
        });

        const correctCount = processedResponses.filter(r => r.isCorrect).length;
        const accuracy = responses.length > 0 ? correctCount / responses.length : 0;

        return {
            case: caseData,
            responses: processedResponses,
            assignments,
            stats: {
                totalResponses: responses.length,
                totalAssignments: assignments.length,
                accuracy,
                averageTimeSeconds: responses.reduce((acc, r) => acc + r.timeSpentSeconds, 0) / (responses.length || 1)
            }
        };
    }

    async getClinicianPerformance() {
        const clinicians = await this.userRepo.find({ where: { role: 'clinician' } });
        const performanceData: Array<{
            id: string;
            name: string;
            email: string;
            totalAssignments: number;
            completedCases: number;
            accuracy: number;
            averageTimeSeconds: number;
        }> = [];

        for (const clinician of clinicians) {
            const responses = await this.responseRepo.find({
                where: { userId: clinician.id },
                relations: ['case']
            });

            const assignments = await this.assignmentRepo.count({ where: { userId: clinician.id } });
            const completed = await this.assignmentRepo.count({ where: { userId: clinician.id, status: 'completed' } });

            let correctCount = 0;
            let totalTime = 0;

            responses.forEach(r => {
                if (r.case && r.diagnosis.toLowerCase().includes(r.case.groundTruthDiagnosis.toLowerCase())) {
                    correctCount++;
                }
                totalTime += r.timeSpentSeconds;
            });

            performanceData.push({
                id: clinician.id,
                name: clinician.name,
                email: clinician.email,
                totalAssignments: assignments,
                completedCases: completed,
                accuracy: responses.length > 0 ? correctCount / responses.length : 0,
                averageTimeSeconds: responses.length > 0 ? totalTime / responses.length : 0
            });
        }

        return performanceData;
    }
}
