"use client";

import React from "react";
import OptimizedImage from "../ui/OptimizedImage";
import ScrollReveal from "../ui/ScrollReveal";
import MagneticButton from "../ui/MagneticButton";

export default function HeroSection() {
  return (
    <section id="hero" className="sticky top-0 h-screen w-full overflow-hidden bg-neutral-950 text-white z-0">
      {/* Peaceful, Serene Flowing Landscape Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <OptimizedImage
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop"
          alt="Serene Flowing Landscape"
          fill
          priority
          className="object-cover object-center transform-gpu scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
          wrapperClassName="w-full h-full absolute inset-0"
          sizes="100vw"
        />
        {/* Subtle Natural Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 pointer-events-none z-10" />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center items-start pt-16">
        <div className="max-w-4xl space-y-6">
          
          <ScrollReveal direction="down" delay={0.1}>
            <span className="text-xs uppercase tracking-[0.35em] text-amber-300 font-semibold drop-shadow-md">
              A Sanctuary For Visionaries
            </span>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.25}>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight uppercase leading-[1.05] drop-shadow-xl">
              Illusion & <br />
              <span className="italic font-light text-amber-200">Pure Inspiration</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4}>
            <p className="text-neutral-200 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed font-light drop-shadow">
              A private members community connecting extraordinary founders through curated masterminds and transformational global retreats.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.55}>
            <div className="pt-4">
              <MagneticButton className="bg-amber-400 text-black border-amber-400 hover:bg-amber-300 shadow-2xl font-bold">
                Explore Sanctuary
              </MagneticButton>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
