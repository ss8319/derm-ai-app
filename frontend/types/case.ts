export interface Case {
    id: string;
    patientId: string;
    age: number;
    gender: string;
    clinicalHistory: string;
    chiefComplaint: string;
    imageUrl: string;
    lesionNumber: number;
    lesionLocation: string;
    dermoscopyUrl?: string;
    groundTruthDiagnosis?: string;
    createdAt: string;
    aiPrediction?: {
        classification: string;
        probability: number;
    };
}
