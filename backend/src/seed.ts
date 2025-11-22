import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Case } from './cases/case.entity';
import { AIPrediction } from './predictions/ai-prediction.entity';
import { User } from './users/user.entity';
import { CaseAssignment } from './assignments/case-assignment.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    const caseRepository = dataSource.getRepository(Case);
    const predictionRepository = dataSource.getRepository(AIPrediction);
    const userRepository = dataSource.getRepository(User);
    const assignmentRepository = dataSource.getRepository(CaseAssignment);

    // Clear existing data
    console.log('Clearing existing data...');
    await assignmentRepository.clear();
    await predictionRepository.clear();
    await caseRepository.clear();
    await userRepository.clear();

    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await userRepository.save({
        email: 'admin@derm.ai',
        password: hashedPassword,
        name: 'Dr. Admin',
        role: 'admin',
        institution: 'University Hospital',
    });

    const clinician1 = await userRepository.save({
        email: 'clinician1@derm.ai',
        password: hashedPassword,
        name: 'Dr. Sarah Johnson',
        role: 'clinician',
        institution: 'City Medical Center',
    });

    const clinician2 = await userRepository.save({
        email: 'clinician2@derm.ai',
        password: hashedPassword,
        name: 'Dr. Michael Chen',
        role: 'clinician',
        institution: 'Regional Hospital',
    });

    console.log('Creating sample cases...');

    // Create sample cases
    const case1 = caseRepository.create({
        patientId: 'P-1001',
        age: 34,
        gender: 'Male',
        clinicalHistory: 'Red rash on arm, itchy, started 2 days ago. No known allergies.',
        chiefComplaint: 'Itchy rash',
        imageUrl: 'https://placehold.co/600x400/e74c3c/ffffff?text=Eczema+Case',
        groundTruthDiagnosis: 'Atopic Dermatitis (Eczema)',
    });

    const case2 = caseRepository.create({
        patientId: 'P-1002',
        age: 28,
        gender: 'Female',
        clinicalHistory: 'Dark spot on back, irregular border, noticed 3 months ago.',
        chiefComplaint: 'Suspicious mole',
        imageUrl: 'https://placehold.co/600x400/34495e/ffffff?text=Melanoma+Case',
        groundTruthDiagnosis: 'Malignant Melanoma',
    });

    const case3 = caseRepository.create({
        patientId: 'P-1003',
        age: 45,
        gender: 'Male',
        clinicalHistory: 'Scaly patches on elbows and knees, recurring for years.',
        chiefComplaint: 'Scaly skin patches',
        imageUrl: 'https://placehold.co/600x400/3498db/ffffff?text=Psoriasis+Case',
        groundTruthDiagnosis: 'Plaque Psoriasis',
    });

    const savedCase1 = await caseRepository.save(case1);
    const savedCase2 = await caseRepository.save(case2);
    const savedCase3 = await caseRepository.save(case3);

    console.log('Creating AI predictions...');

    // Create AI predictions
    await predictionRepository.save({
        caseId: savedCase1.id,
        predictedCondition: 'Eczema',
        confidence: 0.92,
        modelVersion: 'v1.0',
        additionalPredictions: [
            { condition: 'Contact Dermatitis', confidence: 0.06 },
            { condition: 'Psoriasis', confidence: 0.02 },
        ],
    });

    await predictionRepository.save({
        caseId: savedCase2.id,
        predictedCondition: 'Melanoma',
        confidence: 0.85,
        modelVersion: 'v1.0',
        additionalPredictions: [
            { condition: 'Dysplastic Nevus', confidence: 0.10 },
            { condition: 'Seborrheic Keratosis', confidence: 0.05 },
        ],
    });

    await predictionRepository.save({
        caseId: savedCase3.id,
        predictedCondition: 'Psoriasis',
        confidence: 0.88,
        modelVersion: 'v1.0',
        additionalPredictions: [
            { condition: 'Eczema', confidence: 0.08 },
            { condition: 'Lichen Planus', confidence: 0.04 },
        ],
    });

    console.log('Creating case assignments...');

    // Assign all cases to admin (for testing admin view)
    await assignmentRepository.save([
        { caseId: savedCase1.id, userId: adminUser.id, status: 'pending' },
        { caseId: savedCase2.id, userId: adminUser.id, status: 'pending' },
        { caseId: savedCase3.id, userId: adminUser.id, status: 'pending' },
    ]);

    // Assign cases to clinician1 (cases 1 and 2)
    await assignmentRepository.save([
        { caseId: savedCase1.id, userId: clinician1.id, status: 'pending' },
        { caseId: savedCase2.id, userId: clinician1.id, status: 'pending' },
    ]);

    // Assign cases to clinician2 (cases 2 and 3)
    await assignmentRepository.save([
        { caseId: savedCase2.id, userId: clinician2.id, status: 'pending' },
        { caseId: savedCase3.id, userId: clinician2.id, status: 'pending' },
    ]);

    console.log('✅ Seed data created successfully!');
    console.log(`- Created ${await userRepository.count()} users`);
    console.log(`- Created ${await caseRepository.count()} cases`);
    console.log(`- Created ${await predictionRepository.count()} predictions`);
    console.log(`- Created ${await assignmentRepository.count()} assignments`);

    await app.close();
}

seed()
    .then(() => {
        console.log('Seeding complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });
