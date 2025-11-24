'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '../../../lib/api';
import { Case } from '../../../types/case';

export default function PatientDetailPage() {
    const params = useParams();
    const [lesions, setLesions] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLesions = async () => {
            try {
                const data = await apiFetch<Case[]>(`/cases/patients/${params.patientId}/lesions`);
                setLesions(data);
            } catch (err) {
                setError('Failed to load lesions. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (params.patientId) {
            fetchLesions();
        }
    }, [params.patientId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading lesions...</p>
                </div>
            </div>
        );
    }

    if (error || lesions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-red-600">
                    <p>{error || 'No lesions found for this patient'}</p>
                    <Link href="/patients" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
                        ← Back to Patients
                    </Link>
                </div>
            </div>
        );
    }

    const patient = lesions[0];

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link href="/patients" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
                        ← Back to Patients
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Patient {patient.patientId}</h1>
                            <p className="text-gray-600 mt-2">
                                {patient.age} years old • {patient.gender} • {lesions.length} lesions
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {lesions.map((lesion) => (
                        <Link
                            key={lesion.id}
                            href={`/cases/${lesion.id}`}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                        >
                            <div className="relative h-48 w-full bg-gray-100">
                                <Image
                                    src={`http://localhost:3000${lesion.imageUrl}`}
                                    alt={`Lesion ${lesion.lesionNumber}`}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Lesion #{lesion.lesionNumber}
                                    </h3>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                        {lesion.lesionLocation}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-1">{lesion.chiefComplaint}</p>
                                <p className="text-xs text-gray-500 line-clamp-2">{lesion.clinicalHistory}</p>
                                <div className="mt-4">
                                    <span className="text-indigo-600 font-medium text-sm group-hover:text-indigo-800">
                                        View Details →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
