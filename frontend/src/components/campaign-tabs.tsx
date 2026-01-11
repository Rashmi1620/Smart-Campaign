"use client";
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

// Campaign Component logic
interface CampaignData {
    audience_result: any;
    research_result: any;
    strategy_result: any;
    content_result: any;
}

export function CampaignTabs({ campaign }: { campaign: CampaignData }) {
    const { audience_result, research_result, strategy_result, content_result } = campaign;

    const isAudienceReady = !!audience_result;
    const isResearchReady = !!research_result;
    const isStrategyReady = !!strategy_result;
    const isContentReady = !!content_result;

    const [activeTab, setActiveTab] = useState('audience');

    const tabs = [
        { id: 'audience', label: 'Audience', icon: '👥', ready: isAudienceReady },
        { id: 'research', label: 'Research', icon: '🔍', ready: isResearchReady },
        { id: 'strategy', label: 'Strategy', icon: '🧠', ready: isStrategyReady },
        { id: 'content', label: 'Content', icon: '✍️', ready: isContentReady },
    ];

    return (
        <div className="w-full">
            {/* Tab Buttons */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => tab.ready && setActiveTab(tab.id)}
                        disabled={!tab.ready}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer",
                            activeTab === tab.id
                                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25"
                                : "text-gray-400 hover:text-white hover:bg-white/5",
                            !tab.ready && "opacity-40 cursor-not-allowed"
                        )}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'audience' && (
                    <div className="space-y-4 animate-in fade-in-0 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <span className="text-xl">👥</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Audience Analysis</h3>
                                <p className="text-gray-400 text-sm">Target audience insights and segmentation</p>
                            </div>
                        </div>

                        {audience_result ? (
                            <div className="space-y-4">
                                {/* Validation Status */}
                                <div className={cn(
                                    "p-4 rounded-xl border",
                                    audience_result.validation === "Valid"
                                        ? "bg-green-500/10 border-green-500/20"
                                        : "bg-yellow-500/10 border-yellow-500/20"
                                )}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={audience_result.validation === "Valid" ? "text-green-400" : "text-yellow-400"}>
                                            {audience_result.validation === "Valid" ? "✓" : "⚠"}
                                        </span>
                                        <span className={cn(
                                            "font-medium",
                                            audience_result.validation === "Valid" ? "text-green-400" : "text-yellow-400"
                                        )}>
                                            {audience_result.validation || "Analyzed"}
                                        </span>
                                    </div>
                                    <p className="text-gray-300">{audience_result.critique || audience_result.analysis || JSON.stringify(audience_result)}</p>
                                </div>

                                {/* Personas */}
                                {audience_result.personas && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-400 mb-3">Micro-Personas</h4>
                                        <div className="grid gap-3">
                                            {audience_result.personas.map((persona: any, i: number) => (
                                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <h5 className="text-purple-400 font-medium mb-2">{persona.name}</h5>
                                                    <p className="text-gray-400 text-sm mb-1"><strong>Pain Point:</strong> {persona.pain_point}</p>
                                                    <p className="text-gray-400 text-sm"><strong>Hook:</strong> {persona.hook}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fallback for old data format */}
                                {audience_result.data && (
                                    <>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                            <p className="text-gray-300 leading-relaxed">{audience_result.data.analysis}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-3">Key Segments</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {audience_result.data.segments?.map((seg: string, i: number) => (
                                                    <span
                                                        key={i}
                                                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium"
                                                    >
                                                        {seg}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <WaitingState message="Analyzing target audience..." />
                        )}
                    </div>
                )}

                {activeTab === 'research' && (
                    <div className="space-y-4 animate-in fade-in-0 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <span className="text-xl">🔍</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Market Research</h3>
                                <p className="text-gray-400 text-sm">Competitive analysis and market insights</p>
                            </div>
                        </div>

                        {research_result ? (
                            <div className="grid gap-4">
                                {/* Competitor Weakness */}
                                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-5">
                                    <h4 className="text-sm font-medium text-red-400 mb-2">Competitor Weakness (Kill Shot)</h4>
                                    <p className="text-white font-medium text-lg">{research_result.competitor_weakness || research_result.data?.summary}</p>
                                </div>

                                {/* Market Gap */}
                                {research_result.market_gap && (
                                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5">
                                        <h4 className="text-sm font-medium text-green-400 mb-2">Market Gap (Opportunity)</h4>
                                        <p className="text-gray-300">{research_result.market_gap}</p>
                                    </div>
                                )}

                                {/* Pricing Model */}
                                {research_result.pricing_model && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                        <h4 className="text-sm font-medium text-cyan-400 mb-2">Competitor Pricing Model</h4>
                                        <p className="text-gray-300">{research_result.pricing_model}</p>
                                    </div>
                                )}

                                {/* Fallback for old format */}
                                {research_result.data && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                        <h4 className="text-sm font-medium text-purple-400 mb-2">Analysis</h4>
                                        <p className="text-gray-300">{research_result.data.competitor_analysis}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <WaitingState message="Researching market and competitors..." />
                        )}
                    </div>
                )}

                {activeTab === 'strategy' && (
                    <div className="space-y-4 animate-in fade-in-0 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <span className="text-xl">🧠</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Campaign Strategy</h3>
                                <p className="text-gray-400 text-sm">Strategic recommendations and action plan</p>
                            </div>
                        </div>

                        {strategy_result ? (
                            <div className="grid gap-4">
                                {/* Core Message */}
                                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5">
                                    <h4 className="text-sm font-medium text-purple-400 mb-2">Core Message</h4>
                                    <p className="text-white font-bold text-xl">{strategy_result.core_message || strategy_result.data?.angle}</p>
                                </div>

                                {/* Attack Angle */}
                                {strategy_result.attack_angle && (
                                    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-5">
                                        <h4 className="text-sm font-medium text-orange-400 mb-2">Attack Angle</h4>
                                        <p className="text-gray-300">{strategy_result.attack_angle}</p>
                                    </div>
                                )}

                                {/* Channels */}
                                {strategy_result.channels && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                        <h4 className="text-sm font-medium text-cyan-400 mb-3">Channel Strategy</h4>
                                        <div className="space-y-3">
                                            {strategy_result.channels.map((channel: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                    <div>
                                                        <span className="text-white font-medium">{channel.name}</span>
                                                        <p className="text-gray-400 text-sm">{channel.reason}</p>
                                                    </div>
                                                    <span className="text-cyan-400 font-bold">{channel.budget_split}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fallback for old format */}
                                {strategy_result.data && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                            <h4 className="text-sm font-medium text-cyan-400 mb-3">Channels</h4>
                                            <div className="space-y-2">
                                                {strategy_result.data.channels?.map((chan: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 text-gray-300">
                                                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                                        {chan}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                            <h4 className="text-sm font-medium text-purple-400 mb-3">Tactics</h4>
                                            <div className="space-y-2">
                                                {strategy_result.data.tactics?.map((tactic: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 text-gray-300">
                                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                        {tactic}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <WaitingState message="Generating campaign strategy..." />
                        )}
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-4 animate-in fade-in-0 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                <span className="text-xl">✍️</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Ad Content</h3>
                                <p className="text-gray-400 text-sm">Generated ad copy and creative assets</p>
                            </div>
                        </div>

                        {content_result ? (
                            <div className="space-y-4">
                                {/* Main Ad Copy */}
                                <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 rounded-xl p-6">
                                    <h4 className="text-sm font-medium text-purple-400 mb-3">Main Ad Copy</h4>
                                    <blockquote className="text-xl text-white font-medium italic leading-relaxed">
                                        &quot;{content_result.ad_copy_main || content_result.data?.ad_copy}&quot;
                                    </blockquote>
                                </div>

                                {/* Ad Hook */}
                                {content_result.ad_hook && (
                                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5">
                                        <h4 className="text-sm font-medium text-cyan-400 mb-2">Video Hook (First 3 Seconds)</h4>
                                        <p className="text-white font-medium">{content_result.ad_hook}</p>
                                    </div>
                                )}

                                {/* Visual Prompt */}
                                {content_result.visual_prompt && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                        <h4 className="text-sm font-medium text-pink-400 mb-2">AI Image Prompt</h4>
                                        <p className="text-gray-300 italic">{content_result.visual_prompt}</p>
                                    </div>
                                )}

                                {/* Safety Audit */}
                                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-green-400 font-medium">Safety Audit</p>
                                        <p className="text-gray-400 text-sm">{content_result.safety_audit || content_result.data?.safety_check || "Passed"}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <WaitingState message="Creating ad content..." />
                        )}

                        {/* Instagram Posts Section - User Requested Feature */}
                        {content_result && content_result.instagram_posts && (
                            <div className="space-y-4 animate-in fade-in-0 duration-500 delay-150">
                                <div className="flex items-center gap-3 mt-8 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                                        <span className="text-xl">📸</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Instagram Strategy</h3>
                                        <p className="text-gray-400 text-sm">Social media content for Nano Banana Pro</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {content_result.instagram_posts.map((post: any, i: number) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-pink-500/30 transition-all group">
                                            {/* Mock Image Placeholder */}
                                            <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="text-center p-4">
                                                    <span className="text-4xl mb-2 block">🍌</span>
                                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Visual Concept</p>
                                                    <p className="text-gray-400 text-sm mt-2">{post.image_idea}</p>
                                                </div>
                                            </div>

                                            <div className="p-5">
                                                <div className="mb-3">
                                                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Key/Message</span>
                                                    <p className="text-gray-300 text-sm line-clamp-2">{post.key_message_ref}</p>
                                                </div>

                                                <div>
                                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Caption</span>
                                                    <p className="text-white text-sm whitespace-pre-wrap mt-1 font-medium">{post.post_caption}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function WaitingState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">{message}</p>
        </div>
    );
}
