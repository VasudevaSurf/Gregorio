"use client";

import React from "react";
import OptimizedImage from "../ui/OptimizedImage";
import ScrollReveal from "../ui/ScrollReveal";

export default function OverlappingNarrativeSection() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 sm:py-10 flex flex-col justify-between min-h-[calc(100vh-60px)] space-y-8">
      {/* Editorial Headline & Statement */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-8 space-y-3">
          <ScrollReveal direction="down">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
              02 // ARCHITECTURE
            </span>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.15}>
            <h3 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold uppercase leading-tight">
              The Right Circle Does Not Just Change Your Business. <br />
              <span className="italic font-light text-neutral-400">It Changes Your Vision.</span>
            </h3>
          </ScrollReveal>
        </div>

        <div className="md:col-span-4 space-y-2 text-neutral-400 text-xs sm:text-sm leading-relaxed font-light">
          <ScrollReveal direction="up" delay={0.3}>
            <p>
              A sanctuary designed to bring together leaders around masterminds, intimate summits, and life-changing global journeys.
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
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop"
                alt="Megève Summit"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-mono">MEGÈVE / FRENCH ALPS</span>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                Winter Founders Mastermind
              </h4>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 2 */}
        <ScrollReveal direction="up" delay={0.35}>
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 hover:border-amber-400/50 transition-all duration-500">
            <div className="aspect-[16/9] relative w-full overflow-hidden rounded-xl">
              <OptimizedImage
                src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop"
                alt="Croatia Sailing"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-mono">CROATIA / ADRIATIC</span>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                Adriatic Yacht Expedition
              </h4>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
