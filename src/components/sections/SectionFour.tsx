"use client";

import React from "react";
import OptimizedImage from "../ui/OptimizedImage";
import ScrollReveal from "../ui/ScrollReveal";

export default function SectionFour() {
    return (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 sm:py-10 flex flex-col justify-between min-h-[calc(100vh-60px)] space-y-8">
            {/* Editorial Headline & Statement */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-8 space-y-3">
                    <ScrollReveal direction="down">
                        <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
                            04 // THE GATHERING
                        </span>
                    </ScrollReveal>

                    <ScrollReveal direction="up" delay={0.15}>
                        <h3 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold uppercase leading-tight">
                            People Who Build Rooms Change <br />
                            <span className="italic font-light text-neutral-400">The People Inside Them.</span>
                        </h3>
                    </ScrollReveal>
                </div>

                <div className="md:col-span-4 space-y-2 text-neutral-400 text-xs sm:text-sm leading-relaxed font-light">
                    <ScrollReveal direction="up" delay={0.3}>
                        <p>
                            Every circle is curated, not collected — leaders selected for how they think, not just what they have built.
                        </p>
                    </ScrollReveal>
                </div>
            </div>

            {/* Dynamic Media Cards (Tuned Aspect Ratio to Fit Screen Height) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">

                {/* Card 1 */}
                <ScrollReveal direction="up" delay={0.2}>
                    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 hover:border-amber-400/50 transition-all duration-500">
                        <div className="aspect-[16/9] relative w-full overflow-hidden rounded-xl">
                            <OptimizedImage
                                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop"
                                alt="Lisbon Retreat"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-400 font-mono">LISBON / PORTUGAL</span>
                            <h4 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                                Coastal Founders Circle
                            </h4>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Card 2 */}
                <ScrollReveal direction="up" delay={0.35}>
                    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 hover:border-amber-400/50 transition-all duration-500">
                        <div className="aspect-[16/9] relative w-full overflow-hidden rounded-xl">
                            <OptimizedImage
                                src="https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=1200&auto=format&fit=crop"
                                alt="Marrakech Summit"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-400 font-mono">MARRAKECH / MOROCCO</span>
                            <h4 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                                Desert Vision Summit
                            </h4>
                        </div>
                    </div>
                </ScrollReveal>

            </div>
        </div>
    );
}