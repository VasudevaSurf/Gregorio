"use client";

import React from "react";
import OptimizedImage from "../ui/OptimizedImage";
import ScrollReveal from "../ui/ScrollReveal";

export default function SectionThree() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 sm:py-8 flex flex-col justify-between space-y-6">

      {/* Feature Visual Grid */}
      <ScrollReveal direction="up" delay={0.3}>
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-6 md:p-8 space-y-4 hover:border-amber-400/50 transition-all duration-500">
          <div className="aspect-[21/9] relative w-full overflow-hidden rounded-xl">
            <OptimizedImage
              src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop"
              alt="Kyoto Summit"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-amber-400 font-mono">KYOTO / JAPAN</span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Zen Sanctuary Gathering
              </h4>
            </div>
            <span className="text-xs font-mono text-neutral-400">03 // GREGORIO EXPEDITION</span>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
