import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './case.entity';
import { AIPrediction } from '../predictions/ai-prediction.entity';

@Injectable()
export class CasesService {
    constructor(
        @InjectRepository(Case)
        private caseRepository: Repository<Case>,
        @InjectRepository(AIPrediction)
        private predictionRepository: Repository<AIPrediction>,
    ) { }

    async findAll(): Promise<Case[]> {
        return this.caseRepository.find();
    }

    async findOne(id: string): Promise<Case | null> {
        return this.caseRepository.findOne({
            where: { id },
        });
    }

    async create(caseData: Partial<Case>): Promise<Case> {
        const newCase = this.caseRepository.create(caseData);
        return this.caseRepository.save(newCase);
    }

    async getPredictionsForCase(caseId: string): Promise<AIPrediction[]> {
        return this.predictionRepository.find({
            where: { caseId },
        });
    }

    async getPatients(): Promise<Array<{ patientId: string; lesionCount: number; age: number; gender: string }>> {
        const result = await this.caseRepository
            .createQueryBuilder('case')
            .select('case.patientId', 'patientId')
            .addSelect('COUNT(case.id)', 'lesionCount')
            .addSelect('MAX(case.age)', 'age')
            .addSelect('MAX(case.gender)', 'gender')
            .groupBy('case.patientId')
            .getRawMany();

        return result.map(r => ({
            patientId: r.patientId,
            lesionCount: parseInt(r.lesionCount),
            age: r.age,
            gender: r.gender
        }));
    }

    async getLesionsByPatient(patientId: string): Promise<Case[]> {
        return this.caseRepository.find({
            where: { patientId },
            order: { lesionNumber: 'ASC' }
        });
    }
}
