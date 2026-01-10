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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <p className="text-gray-400">Loading Campaign...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-red-400 font-medium">{error}</p>
            </div>
        </div>
    );

    if (!campaign) return null;

    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { color: string; icon: string; text: string }> = {
            'started': { color: 'from-yellow-500 to-orange-500', icon: '⚡', text: 'Starting' },
            'processing_audience': { color: 'from-blue-500 to-cyan-500', icon: '👥', text: 'Audience' },
            'processing_research': { color: 'from-purple-500 to-pink-500', icon: '🔍', text: 'Research' },
            'processing_strategy': { color: 'from-green-500 to-emerald-500', icon: '🧠', text: 'Strategy' },
            'processing_content': { color: 'from-orange-500 to-red-500', icon: '✍️', text: 'Content' },
            'completed': { color: 'from-green-500 to-emerald-500', icon: '✅', text: 'Completed' },
            'failed': { color: 'from-red-500 to-rose-500', icon: '❌', text: 'Failed' },
        };
        return statusMap[status] || { color: 'from-gray-500 to-gray-600', icon: '⏳', text: status };
    };

    const statusInfo = getStatusInfo(campaign.status);

    return (
        <main className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            </div>

            <div className="relative max-w-5xl mx-auto">
                {/* Header Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">{campaign.productName}</h1>
                            </div>
                            <p className="text-gray-400 text-sm">Campaign ID: {id}</p>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${statusInfo.color} text-white font-medium shadow-lg`}>
                            <span>{statusInfo.icon}</span>
                            <span>{statusInfo.text}</span>
                            {campaign.status !== 'completed' && campaign.status !== 'failed' && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-1"></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pipeline Progress */}
                {campaign.status !== 'completed' && campaign.status !== 'failed' && (
                    <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-medium">AI Agents Working...</p>
                                <p className="text-gray-400 text-sm">Processing your campaign in real-time</p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500 animate-pulse"
                                style={{
                                    width: campaign.status === 'started' ? '10%' :
                                        campaign.status === 'processing_audience' ? '25%' :
                                            campaign.status === 'processing_research' ? '50%' :
                                                campaign.status === 'processing_strategy' ? '75%' :
                                                    campaign.status === 'processing_content' ? '90%' : '100%'
                                }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Tabs Section */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                    <CampaignTabs campaign={campaign} />
                </div>
            </div>
        </main>
    );
}
