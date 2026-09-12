"use client";

import React from "react";
import OptimizedVideo from "../ui/OptimizedVideo";
import ScrollReveal from "../ui/ScrollReveal";
import MagneticButton from "../ui/MagneticButton";

export default function HeroSection() {
  return (
    <section id="hero" className="sticky top-0 h-screen w-full overflow-hidden bg-neutral-950 text-white z-0">
      {/* Peaceful, Serene Flowing Landscape — subtle looping video background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <OptimizedVideo
          src="/videos/hero-bg.mp4"
          containerClassName="w-full h-full absolute inset-0"
          className="scale-105 transform-gpu"
          autoPlay
          loop
          muted
          overlay={false}
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
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight uppercase leading-[1.05] drop-shadow-xl">
              THE SKY<br /> ISN'T THE LIMIT...<br />
              <span className="italic font-light text-amber-200">IT'S THE BEGINNING</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4}>
            <p className="text-neutral-200 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed font-light drop-shadow">
              For the driven ones, hungry to experience life at its fullest
            </p>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}