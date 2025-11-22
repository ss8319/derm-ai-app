import Link from 'next/link';
import { Case } from '../types/case';
import Image from 'next/image';

interface CaseCardProps {
    caseData: Case;
}

export default function CaseCard({ caseData }: CaseCardProps) {
    return (
        <Link href={`/cases/${caseData.id}`} className="block group">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100">
                <div className="relative h-48 w-full bg-slate-200">
                    <Image
                        src={caseData.imageUrl}
                        alt={`Case ${caseData.patientId}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-700">
                        {caseData.patientId}
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-semibold text-slate-900">Case {caseData.patientId}</h3>
                            <p className="text-sm text-slate-500">{caseData.age}yo {caseData.gender}</p>
                        </div>
                        {caseData.prediction && (
                            <div className="text-right">
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Prediction</div>
                                <div className="font-medium text-indigo-600">{caseData.prediction.condition}</div>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{caseData.clinicalHistory}</p>
                </div>
            </div>
        </Link>
    );
}
