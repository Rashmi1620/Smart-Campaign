"use client";
import { useEffect, useState, use } from 'react';
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { CampaignTabs } from "@/components/campaign-tabs";

interface CampaignPageProps {
    params: Promise<{ id: string }>
}

export default function CampaignPage({ params }: CampaignPageProps) {
    const { id } = use(params);
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userId = "demo-user";

    useEffect(() => {
        if (!id) return;

        const unsub = onSnapshot(doc(db, "users", userId, "campaigns", id), (doc) => {
            if (doc.exists()) {
                setCampaign(doc.data());
            } else {
                setError("Campaign not found");
            }
            setLoading(false);
        }, (err) => {
            console.error("Firestore Error:", err);
            setError("Failed to load campaign. Check console/config.");
            setLoading(false);
        });

        return () => unsub();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading Campaign...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-lg">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                </div>
                <p className="text-red-600 font-medium">{error}</p>
            </div>
        </div>
    );

    if (!campaign) return null;

    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
            'started': { color: 'bg-yellow-500', text: 'Starting' },
            'processing_audience': { color: 'bg-blue-500', text: 'Analying Audience' },
            'processing_research': { color: 'bg-purple-500', text: 'Researching' },
            'processing_strategy': { color: 'bg-pink-500', text: 'Strategizing' },
            'processing_content': { color: 'bg-orange-500', text: 'Creating Content' },
            'completed': { color: 'bg-green-500', text: 'Completed' },
            'failed': { color: 'bg-red-500', text: 'Failed' },
        };
        return statusMap[status] || { color: 'bg-gray-500', text: status };
    };

    const statusInfo = getStatusInfo(campaign.status);

    return (
        <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Top Navigation / Brand */}
            <nav className="h-16 border-b border-gray-200 bg-white flex items-center px-6 md:px-12 sticky top-0 z-50">
                <div className="font-bold text-xl tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500">
                        MARKETING MIND
                    </span>
                    <span className="text-gray-400 font-light ml-1">AI</span>
                </div>
                <div className="ml-auto text-sm text-gray-500">
                    Campaign ID: <span className="font-mono text-gray-700">{id.substring(0, 8)}...</span>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 md:p-12">

                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
                        Creativity <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">
                            Without Chaos
                        </span>
                    </h1>

                    {/* Status Pill */}
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center gap-2 pl-3 pr-4 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-medium">
                            <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.color} animate-pulse`}></div>
                            {statusInfo.text}
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-6 md:p-8 min-h-[600px]">
                    <CampaignTabs campaign={campaign} />
                </div>
            </div>
        </main>
    );
}
