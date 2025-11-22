export interface Case {
    id: string;
    patientId: string;
    age: number;
    gender: string;
    clinicalHistory: string;
    chiefComplaint: string;
    imageUrl: string;
    dermoscopyUrl?: string;
    groundTruthDiagnosis?: string;
    createdAt: string;
    // We will add prediction later when we fetch it separately or join it
    prediction?: {
        condition: string;
        confidence: number;
    };
}
