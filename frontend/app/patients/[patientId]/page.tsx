'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { Case } from '../../../types/case';

export default function PatientRedirectPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAndRedirect = async () => {
            try {
                const data = await apiFetch<Case[]>(`/cases/patients/${params.patientId}/lesions`);
                if (data && data.length > 0) {
                    // Sort by lesion number just in case
                    const sortedLesions = data.sort((a, b) => a.lesionNumber - b.lesionNumber);
                    router.push(`/cases/${sortedLesions[0].id}`);
                } else {
                    setError('No lesions found for this patient.');
                    setLoading(false);
                }
            } catch (err) {
                setError('Failed to load patient data.');
                console.error(err);
                setLoading(false);
            }
        };

        if (params.patientId) {
            fetchAndRedirect();
        }
    }, [params.patientId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Redirecting to patient case...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center text-red-600">
                <p>{error || 'Patient not found'}</p>
                <Link href="/patients" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
                    ← Back to Patients
                </Link>
            </div>
        </div>
    );
}
