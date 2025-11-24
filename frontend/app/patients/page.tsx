'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Patient {
    patientId: string;
    lesionCount: number;
    age: number;
    gender: string;
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await apiFetch<Patient[]>('/cases/patients/list');
                setPatients(data);
            } catch (err) {
                setError('Failed to load patients. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading patients...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                    <p className="text-gray-600 mt-2">View all patients and their lesions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map((patient) => (
                        <Link
                            key={patient.patientId}
                            href={`/patients/${patient.patientId}`}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{patient.patientId}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {patient.age} years old • {patient.gender}
                                    </p>
                                </div>
                                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {patient.lesionCount} lesions
                                </div>
                            </div>
                            <div className="mt-4">
                                <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                                    View Lesions →
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>

                {patients.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No patients found</p>
                    </div>
                )}
            </div>
        </main>
    );
}
