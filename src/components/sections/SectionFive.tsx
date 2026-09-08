"use client";

import React from "react";
import OptimizedImage from "../ui/OptimizedImage";
import ScrollReveal from "../ui/ScrollReveal";

export default function SectionFive() {
    return (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 sm:py-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
                <ScrollReveal direction="down">
                    <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
                        05 // THE LEGACY
                    </span>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.15}>
                    <h3 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold uppercase leading-tight max-w-4xl">
                        What Begins As A Room <br />
                        <span className="italic font-light text-neutral-400">Becomes A Way Of Working.</span>
                    </h3>
                </ScrollReveal>
            </div>

            {/* Feature Visual Grid */}
            <ScrollReveal direction="up" delay={0.3}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-6 md:p-8 space-y-4 hover:border-amber-400/50 transition-all duration-500">
                    <div className="aspect-[21/9] relative w-full overflow-hidden rounded-xl">
                        <OptimizedImage
                            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop"
                            alt="Swiss Alps Summit"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs text-amber-400 font-mono">ZERMATT / SWITZERLAND</span>
                            <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                                Summit Legacy Council
                            </h4>
                        </div>
                        <span className="text-xs font-mono text-neutral-400">05 // GREGORIO EXPEDITION</span>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    );
}