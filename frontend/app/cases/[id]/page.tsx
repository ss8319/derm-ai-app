'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Case } from '../../../types/case';
import { apiFetch } from '../../../lib/api';

export default function CaseDetail() {
    const { id } = useParams();
    const [caseData, setCaseData] = useState<Case | null>(null);
    const [siblingLesions, setSiblingLesions] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [diagnosis, setDiagnosis] = useState('');
    const [rating, setRating] = useState<number | undefined>(undefined);
    const [comments, setComments] = useState('');
    const [aiAssistanceEnabled, setAiAssistanceEnabled] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchCaseAndSiblings = async () => {
            try {
                // 1. Fetch current case
                const data = await apiFetch<Case>(`/cases/${id}`);
                setCaseData(data);

                // 2. Fetch all lesions for this patient
                if (data && data.patientId) {
                    const siblings = await apiFetch<Case[]>(`/cases/patients/${data.patientId}/lesions`);
                    setSiblingLesions(siblings);
                }
            } catch (e) {
                setError('Failed to load case details.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchCaseAndSiblings();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitMessage(null);
        try {
            await apiFetch('/responses', {
                method: 'POST',
                body: JSON.stringify({
                    diagnosis,
                    rating,
                    comments,
                    aiAssistanceEnabled,
                    timeSpentSeconds: timeSpent,
                    caseId: id,
                }),
            });
            setSubmitMessage('Success: Diagnosis submitted.');
        } catch (e: any) {
            setSubmitMessage(e.message || 'Failed to submit diagnosis.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Case Not Found</h1>
                <p className="text-gray-600 mb-8">{error || 'The requested case could not be found.'}</p>
                <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    &larr; Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link href={`/patients/${caseData.patientId}`} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                        &larr; Back to Patient {caseData.patientId}
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar: Sibling Lesions */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                Patient Lesions ({siblingLesions.length})
                            </h3>
                            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                                {siblingLesions.map((lesion) => (
                                    <Link
                                        key={lesion.id}
                                        href={`/cases/${lesion.id}`}
                                        className={`block p-2 rounded-lg border transition-all ${lesion.id === caseData.id
                                            ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="relative w-12 h-12 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                                                <Image
                                                    src={`http://localhost:3000${lesion.imageUrl}`}
                                                    alt={`Lesion ${lesion.lesionNumber}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${lesion.id === caseData.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                    Lesion #{lesion.lesionNumber}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{lesion.lesionLocation}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                                {/* Image Section */}
                                <div className="relative h-96 lg:h-auto bg-gray-100 min-h-[500px]">
                                    <Image
                                        src={`http://localhost:3000${caseData.imageUrl}`}
                                        alt={`Case ${caseData.id}`}
                                        fill
                                        className="object-contain"
                                    />
                                </div>

                                {/* Details Section */}
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                Lesion #{caseData.lesionNumber}: {caseData.lesionLocation}
                                            </h1>
                                            <p className="text-gray-500 mt-1">
                                                Patient {caseData.patientId} • {caseData.age} years • {caseData.gender}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                            {caseData.lesionNumber === 1 ? 'Primary' : 'Secondary'}
                                        </span>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Clinical History</h3>
                                            <p className="text-gray-700 leading-relaxed">{caseData.clinicalHistory}</p>
                                        </div>

                                        {/* Clinician Response Form */}
                                        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-100">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Diagnosis *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    value={diagnosis}
                                                    onChange={e => setDiagnosis(e.target.value)}
                                                    placeholder="Enter your diagnosis..."
                                                />
                                            </div>
                                            <div className="flex space-x-4">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700">Rating (1‑5)</label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={5}
                                                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        value={rating ?? ''}
                                                        onChange={e => setRating(e.target.value ? Number(e.target.value) : undefined)}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700">Time (sec)</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        value={timeSpent}
                                                        onChange={e => setTimeSpent(Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Comments</label>
                                                <textarea
                                                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    rows={3}
                                                    value={comments}
                                                    onChange={e => setComments(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="aiAssist"
                                                    checked={aiAssistanceEnabled}
                                                    onChange={e => setAiAssistanceEnabled(e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="aiAssist" className="ml-2 block text-sm text-gray-900">
                                                    Enable AI assistance
                                                </label>
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Submit Diagnosis
                                            </button>
                                            {submitMessage && (
                                                <p className={`mt-2 text-sm text-center ${submitMessage.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                                                    {submitMessage}
                                                </p>
                                            )}
                                        </form>

                                        {/* Navigation Buttons */}
                                        <div className="flex justify-between pt-4 border-t border-gray-100">
                                            {siblingLesions.findIndex(l => l.id === caseData.id) > 0 ? (
                                                <Link
                                                    href={`/cases/${siblingLesions[siblingLesions.findIndex(l => l.id === caseData.id) - 1].id}`}
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    title="Previous Lesion"
                                                >
                                                    &larr;
                                                </Link>
                                            ) : (
                                                <div></div> // Spacer
                                            )}

                                            {siblingLesions.findIndex(l => l.id === caseData.id) < siblingLesions.length - 1 && (
                                                <Link
                                                    href={`/cases/${siblingLesions[siblingLesions.findIndex(l => l.id === caseData.id) + 1].id}`}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    title="Next Lesion"
                                                >
                                                    &rarr;
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
