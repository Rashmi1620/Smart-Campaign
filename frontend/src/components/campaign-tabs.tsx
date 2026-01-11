"use client";
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface CampaignData {
    context?: any;
    audience?: any;
    emotion?: any;
    trends?: any;
    competitor?: any;
    content?: any;
    status?: string;
}

export function CampaignTabs({ campaign }: { campaign: CampaignData }) {
    const [mainTab, setMainTab] = useState<'analysis' | 'content'>('analysis');
    const [contentTab, setContentTab] = useState<'instagram' | 'twitter' | 'linkedin'>('instagram');

    const isContentReady = !!campaign.content;

    return (
        <div className="w-full">
            {/* Main Tabs (Pill Style) */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-full inline-flex">
                    <button
                        onClick={() => setMainTab('analysis')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                            mainTab === 'analysis'
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        Analysis & Strategy
                    </button>
                    <button
                        onClick={() => setMainTab('content')}
                        disabled={!isContentReady}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                            mainTab === 'content'
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900",
                            !isContentReady && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        Content Generation
                    </button>
                </div>
            </div>

            {/* Tab Panels */}
            {mainTab === 'analysis' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* 1. Context & Audience */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <SectionCard title="Target Audience" icon="👥">
                            {campaign.audience ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <div className="text-purple-900 font-semibold mb-1">Primary Persona</div>
                                        <div className="text-purple-700">{campaign.audience.primary_persona || "Analyzing..."}</div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Beliefs</div>
                                        <div className="flex flex-wrap gap-2">
                                            {campaign.audience.beliefs?.map((b: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm">{b}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : <Skeleton />}
                        </SectionCard>

                        <SectionCard title="Market Context" icon="🌍">
                            {campaign.context ? (
                                <div className="space-y-4">
                                    <InfoRow label="Market" value={campaign.context.market_category} />
                                    <InfoRow label="Goal" value={campaign.context.campaign_intent} />
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="text-blue-900 font-semibold mb-1">Product Summary</div>
                                        <div className="text-blue-700 text-sm leading-relaxed">{campaign.context.product_summary}</div>
                                    </div>
                                </div>
                            ) : <Skeleton />}
                        </SectionCard>
                    </div>

                    {/* 2. Deep Dive (Trends & Competitors) */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <SectionCard title="Trend Analysis" icon="📈">
                            {campaign.trends ? (
                                <div className="space-y-4">
                                    {campaign.trends.narrative_trends_aligned?.map((trend: any, i: number) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold mt-0.5">✓</div>
                                            <div className="flex-1">
                                                {typeof trend === 'string' ? (
                                                    <p className="text-gray-600 text-sm">{trend}</p>
                                                ) : (
                                                    <>
                                                        <p className="text-gray-900 font-semibold text-sm mb-1">{trend.trend_name || trend.name}</p>
                                                        <p className="text-gray-600 text-sm">{trend.description}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {campaign.trends.fatigued_patterns?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Avoid (Fatigue)</div>
                                            {campaign.trends.fatigued_patterns.map((bad: any, i: number) => (
                                                <p key={i} className="text-gray-500 text-sm mb-1">
                                                    • {typeof bad === 'string' ? bad : bad.pattern || bad.description}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : <Skeleton />}
                        </SectionCard>

                        <SectionCard title="Competitor Landscape" icon="⚔️">
                            {campaign.competitor ? (
                                <div className="space-y-3">
                                    {campaign.competitor.positioning_gaps?.map((gap: any, i: number) => (
                                        <div key={i} className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-orange-800 text-sm">
                                            {typeof gap === 'string' ? (
                                                <span className="font-medium">🎯 Gap: {gap}</span>
                                            ) : (
                                                <>
                                                    <div className="font-bold mb-1">🎯 {gap.gap_name || 'Gap'}</div>
                                                    <div className="text-xs">{gap.description}</div>
                                                    {gap.potential_positioning_statement && (
                                                        <div className="mt-2 text-xs italic text-orange-700">💡 {gap.potential_positioning_statement}</div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    <div className="space-y-2 mt-2">
                                        {campaign.competitor.counter_narratives?.map((cn: any, i: number) => (
                                            <p key={i} className="text-gray-500 text-sm pl-2 border-l-2 border-gray-200">
                                                {typeof cn === 'string' ? cn : cn.narrative || cn.description}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ) : <Skeleton />}
                        </SectionCard>
                    </div>
                </div>
            ) : (
                /* CONTENT TAB */
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid md:grid-cols-12 gap-8">
                        {/* Sidebar */}
                        <div className="md:col-span-3 space-y-2">
                            <SocialButton
                                active={contentTab === 'instagram'}
                                onClick={() => setContentTab('instagram')}
                                icon="📸" label="Instagram"
                            />
                            <SocialButton
                                active={contentTab === 'twitter'}
                                onClick={() => setContentTab('twitter')}
                                icon="🐦" label="Twitter / X"
                            />
                            <SocialButton
                                active={contentTab === 'linkedin'}
                                onClick={() => setContentTab('linkedin')}
                                icon="💼" label="LinkedIn"
                            />
                        </div>

                        {/* Preview Area */}
                        <div className="md:col-span-9">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                                {/* Mockup Header */}
                                <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400/20"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400/20"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400/20"></div>
                                    </div>
                                    <div className="ml-auto text-xs text-gray-400 font-mono">
                                        {contentTab === 'instagram' ? 'instagram.com' : contentTab === 'twitter' ? 'x.com' : 'linkedin.com'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    {contentTab === 'instagram' && campaign.content?.instagram && (
                                        <div className="max-w-md mx-auto space-y-6">
                                            {/* Image Placeholder */}
                                            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 flex-col gap-2 p-8 text-center border-2 border-dashed border-gray-200">
                                                <span className="text-2xl">🖼️</span>
                                                <span className="text-sm font-medium">Visual Concept</span>
                                                <span className="text-xs">{campaign.content.instagram.visual_description}</span>
                                            </div>
                                            {/* Caption */}
                                            <div className="space-y-2">
                                                <div className="flex gap-2 items-center">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600"></div>
                                                    <div className="text-sm font-bold">your_brand</div>
                                                </div>
                                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                    {campaign.content.instagram.caption}
                                                </p>
                                                <div className="text-blue-600 text-sm">
                                                    {campaign.content.instagram.hashtags?.map((t: string) => `#${t} `)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {contentTab === 'twitter' && campaign.content?.twitter_thread && (
                                        <div className="max-w-md mx-auto relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100">
                                            {campaign.content.twitter_thread.map((tweet: string, i: number) => (
                                                <div key={i} className="relative">
                                                    <div className="absolute -left-8 top-0 w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold border-4 border-white">
                                                        {i + 1}
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-xl rounded-tl-none border border-gray-100">
                                                        <div className="flex gap-2 items-center mb-2">
                                                            <div className="font-bold text-gray-900">Your Brand</div>
                                                            <div className="text-gray-400 text-sm">@handle</div>
                                                        </div>
                                                        <p className="text-gray-800 whitespace-pre-wrap">{tweet}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {contentTab === 'linkedin' && campaign.content?.linkedin_post && (
                                        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="p-4 border-b border-gray-100 flex gap-3">
                                                <div className="w-12 h-12 rounded bg-blue-600"></div>
                                                <div>
                                                    <div className="font-bold text-gray-900">Your Brand</div>
                                                    <div className="text-xs text-gray-500">Promoted</div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                    {campaign.content.linkedin_post.text}
                                                </p>
                                            </div>
                                            {campaign.content.linkedin_post.professional_tone_notes && (
                                                <div className="bg-blue-50 p-3 text-xs text-blue-700 m-4 rounded-lg">
                                                    💡 Tone Note: {campaign.content.linkedin_post.professional_tone_notes}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components for cleaner code
function SectionCard({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-500 text-sm font-medium">{label}</span>
            <span className="text-gray-900 text-sm font-semibold">{value || "—"}</span>
        </div>
    );
}

function SocialButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                active
                    ? "bg-gray-900 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50"
            )}
        >
            <span className="text-lg">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
}

function Skeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
        </div>
    );
}
