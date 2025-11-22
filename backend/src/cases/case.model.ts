export interface Case {
    id: string;
    patientId: string;
    age: number;
    gender: string;
    history: string;
    imageUrl: string;
    prediction?: {
        condition: string;
        confidence: number;
    };
}
