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

    console.log('Creating sample patients with multiple lesions...');

    const lesionLocations = [
        'Left arm', 'Right arm', 'Left leg', 'Right leg', 'Back', 'Chest',
        'Face', 'Neck', 'Left hand', 'Right hand', 'Abdomen', 'Shoulder',
        'Left foot', 'Right foot', 'Scalp', 'Forehead', 'Cheek', 'Nose'
    ];

    const diagnoses = [
        'Atopic Dermatitis (Eczema)',
        'Malignant Melanoma',
        'Psoriasis',
        'Basal Cell Carcinoma',
        'Seborrheic Keratosis',
        'Actinic Keratosis',
        'Dermatofibroma',
        'Nevus (Mole)',
        'Contact Dermatitis',
        'Rosacea'
    ];

    const cases: Case[] = [];

    // Create 3 patients with exactly 20 lesions each
    const patients = [
        { id: 'P-1001', age: 34, gender: 'Male', lesionCount: 20 },
        { id: 'P-1002', age: 28, gender: 'Female', lesionCount: 20 },
        { id: 'P-1003', age: 45, gender: 'Male', lesionCount: 20 }
    ];

    for (const patient of patients) {
        for (let i = 1; i <= patient.lesionCount; i++) {
            const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
            const location = lesionLocations[Math.floor(Math.random() * lesionLocations.length)];

            // Alternate between the two real images
            const imageUrl = i % 2 === 0 ? '/Skin.jpg' : '/TBP.jpeg';

            // Generate AI Prediction
            const isMalignant = Math.random() > 0.8; // 20% chance of malignant
            const aiClassification = isMalignant ? 'Malignant' : 'Benign';
            // High confidence for whatever it predicts
            const aiProbability = 0.7 + Math.random() * 0.29;

            const newCase = caseRepository.create({
                patientId: patient.id,
                lesionNumber: i,
                lesionLocation: location,
                age: patient.age,
                gender: patient.gender,
                clinicalHistory: `Patient ${patient.id}, lesion #${i} on ${location}. ${i === 1 ? 'First presentation.' : `Follow-up lesion.`
                    } ${diagnosis.includes('Melanoma') ? 'Irregular border, asymmetric.' : 'Regular appearance.'}`,
                chiefComplaint: `Lesion on ${location}`,
                imageUrl: imageUrl,
                groundTruthDiagnosis: diagnosis,
                aiPrediction: {
                    classification: aiClassification,
                    probability: parseFloat(aiProbability.toFixed(2))
                }
            });

            cases.push(newCase);
        }
    }

    const savedCases = await caseRepository.save(cases);
    console.log(`✅ Created ${savedCases.length} lesions across ${patients.length} patients`);

    // Removed old prediction table logic as we now store it on the case directly

    console.log('Creating case assignments...');

    // Assign all lesions from patient P-1001 to clinician1
    const patient1Cases = savedCases.filter(c => c.patientId === 'P-1001');
    for (const caseItem of patient1Cases) {
        await assignmentRepository.save({
            caseId: caseItem.id,
            userId: clinician1.id,
            status: 'pending'
        });
    }

    // Assign all lesions from patient P-1002 to clinician2
    const patient2Cases = savedCases.filter(c => c.patientId === 'P-1002');
    for (const caseItem of patient2Cases) {
        await assignmentRepository.save({
            caseId: caseItem.id,
            userId: clinician2.id,
            status: 'pending'
        });
    }

    // Assign all lesions from patient P-1003 to both clinicians
    const patient3Cases = savedCases.filter(c => c.patientId === 'P-1003');
    for (const caseItem of patient3Cases) {
        await assignmentRepository.save([
            { caseId: caseItem.id, userId: clinician1.id, status: 'pending' },
            { caseId: caseItem.id, userId: clinician2.id, status: 'pending' }
        ]);
    }

    console.log('✅ Seed data created successfully!');
    console.log(`- Created ${await userRepository.count()} users`);
    console.log(`- Created ${await caseRepository.count()} lesions`);
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
