import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from '../cases/case.entity';
import { AIPrediction } from '../predictions/ai-prediction.entity';
import { User } from '../users/user.entity';
import { CaseAssignment } from '../assignments/case-assignment.entity';
import * as fs from 'fs';
import * as path from 'path';

interface ImportPatientData {
    patientId: string;
    age: number;
    gender: string;
    lesions: Array<{
        lesionNumber: number;
        lesionLocation: string;
        imagePath: string;
        clinicalHistory?: string;
        chiefComplaint?: string;
        groundTruthDiagnosis?: string;
        aiPrediction?: {
            predictedCondition: string;
            confidence: number;
            additionalPredictions?: Array<{
                condition: string;
                confidence: number;
            }>;
        };
    }>;
}

@Injectable()
export class DataImportService {
    constructor(
        @InjectRepository(Case)
        private caseRepo: Repository<Case>,
        @InjectRepository(AIPrediction)
        private predictionRepo: Repository<AIPrediction>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(CaseAssignment)
        private assignmentRepo: Repository<CaseAssignment>,
    ) { }

    /**
     * Import a single patient with all their lesions and AI predictions
     */
    async importPatient(patientData: ImportPatientData): Promise<{
        casesCreated: number;
        predictionsCreated: number;
        patientId: string;
    }> {
        const cases: Case[] = [];
        const predictions: AIPrediction[] = [];

        // Create cases for each lesion
        for (const lesion of patientData.lesions) {
            const newCase = this.caseRepo.create({
                patientId: patientData.patientId,
                lesionNumber: lesion.lesionNumber,
                lesionLocation: lesion.lesionLocation,
                age: patientData.age,
                gender: patientData.gender,
                clinicalHistory: lesion.clinicalHistory || `Patient ${patientData.patientId}, lesion #${lesion.lesionNumber}`,
                chiefComplaint: lesion.chiefComplaint || `Lesion on ${lesion.lesionLocation}`,
                imageUrl: lesion.imagePath,
                groundTruthDiagnosis: lesion.groundTruthDiagnosis || 'Unknown',
            });

            cases.push(newCase);
        }

        // Save all cases
        const savedCases = await this.caseRepo.save(cases);

        // Create AI predictions
        for (let i = 0; i < savedCases.length; i++) {
            const lesion = patientData.lesions[i];
            if (lesion.aiPrediction) {
                const prediction = this.predictionRepo.create({
                    caseId: savedCases[i].id,
                    predictedCondition: lesion.aiPrediction.predictedCondition,
                    confidence: lesion.aiPrediction.confidence,
                    modelVersion: 'imported',
                    additionalPredictions: lesion.aiPrediction.additionalPredictions || [],
                });

                predictions.push(prediction);
            }
        }

        // Save all predictions
        if (predictions.length > 0) {
            await this.predictionRepo.save(predictions);
        }

        return {
            casesCreated: savedCases.length,
            predictionsCreated: predictions.length,
            patientId: patientData.patientId
        };
    }

    /**
     * Import multiple patients from a JSON array
     */
    async importBulkPatients(patientsData: ImportPatientData[]): Promise<{
        totalPatients: number;
        totalCases: number;
        totalPredictions: number;
        errors: Array<{ patientId: string; error: string }>;
    }> {
        let totalCases = 0;
        let totalPredictions = 0;
        const errors: Array<{ patientId: string; error: string }> = [];

        for (const patientData of patientsData) {
            try {
                const result = await this.importPatient(patientData);
                totalCases += result.casesCreated;
                totalPredictions += result.predictionsCreated;
            } catch (error) {
                errors.push({
                    patientId: patientData.patientId,
                    error: error.message
                });
            }
        }

        return {
            totalPatients: patientsData.length - errors.length,
            totalCases,
            totalPredictions,
            errors
        };
    }

    /**
     * Assign imported cases to clinicians
     */
    async assignImportedCases(patientId: string, clinicianIds: string[]): Promise<number> {
        const cases = await this.caseRepo.find({ where: { patientId } });
        const assignments: CaseAssignment[] = [];

        for (const caseItem of cases) {
            for (const clinicianId of clinicianIds) {
                assignments.push(
                    this.assignmentRepo.create({
                        caseId: caseItem.id,
                        userId: clinicianId,
                        status: 'pending'
                    })
                );
            }
        }

        const saved = await this.assignmentRepo.save(assignments);
        return saved.length;
    }

    /**
     * Clear all data (for testing)
     */
    async clearAllData(): Promise<void> {
        await this.assignmentRepo.clear();
        await this.predictionRepo.clear();
        await this.caseRepo.clear();
    }

    /**
     * Get import statistics
     */
    async getImportStats(): Promise<{
        totalPatients: number;
        totalLesions: number;
        totalPredictions: number;
        totalAssignments: number;
    }> {
        const patients = await this.caseRepo
            .createQueryBuilder('case')
            .select('DISTINCT case.patientId')
            .getRawMany();

        return {
            totalPatients: patients.length,
            totalLesions: await this.caseRepo.count(),
            totalPredictions: await this.predictionRepo.count(),
            totalAssignments: await this.assignmentRepo.count()
        };
    }
}
