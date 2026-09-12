"use client";

import React, { useState, useCallback, useEffect } from "react";
import OptimizedImage from "./OptimizedImage";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

export interface CarouselSlide {
  id: string;
  city: string;
  location: string;
  title: string;
  subtitle: string;
  image: string;
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: "megeve",
    city: "MEGÈVE",
    location: "FRENCH ALPS",
    title: "Winter Founders Mastermind",
    subtitle: "Exclusive alpine fireside strategy sessions at 2,000m elevation.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "croatia",
    city: "CROATIA",
    location: "ADRIATIC COAST",
    title: "Adriatic Yacht Expedition",
    subtitle: "7-day island-hopping summit for visionaries and category creators.",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "st-moritz",
    city: "ST. MORITZ",
    location: "SWITZERLAND",
    title: "Alpine Leadership Summit",
    subtitle: "Intimate peer gatherings surrounded by pristine Engadin peaks.",
    image: "https://images.unsplash.com/photo-1548777123-e216912df7d8?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "kyoto",
    city: "KYOTO",
    location: "JAPAN",
    title: "Zen Leadership Retreat",
    subtitle: "Mindfulness, long-term legacy planning, and private temple dinners.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "amalfi",
    city: "AMALFI",
    location: "ITALY",
    title: "Coastal Gathering",
    subtitle: "Private cliffside villa discussions overlooking the Tyrrhenian Sea.",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop",
  },
];

interface ThreeDCarouselProps {
  slides?: CarouselSlide[];
}

export default function ThreeDCarousel({ slides = DEFAULT_SLIDES }: ThreeDCarouselProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const count = slides.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const activeSlide = slides[activeIndex];

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center space-y-8 select-none py-6">
      
      {/* 3D Stage Container */}
      <div
        className="relative w-full h-[340px] sm:h-[380px] flex items-center justify-center overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        {/* 3D Elliptical Ring Track */}
        <div
          className="relative w-[230px] sm:w-[260px] md:w-[280px] h-[290px] sm:h-[330px] md:h-[350px] flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {slides.map((slide, idx) => {
            // Distance from active index
            let diff = idx - activeIndex;
            if (diff > count / 2) diff -= count;
            if (diff < -count / 2) diff += count;

            const absDiff = Math.abs(diff);
            const isActive = idx === activeIndex;

            // 3D Elliptical Ring Math
            // Active center card moves forward (+240px Z), side cards curve backwards into 3D depth (+80px Z & -60px Z)
            const rotateY = diff * 32; // degrees rotation
            const translateX = diff * 150; // horizontal spacing along curve
            const translateZ = absDiff === 0 ? 240 : absDiff === 1 ? 70 : -70; // depth curve
            const scale = absDiff === 0 ? 1.05 : absDiff === 1 ? 0.85 : 0.68;
            const opacity = absDiff === 0 ? 1.0 : absDiff === 1 ? 0.65 : 0.25;
            const zIndex = 50 - absDiff * 10;

            return (
              <div
                key={slide.id}
                onClick={() => setActiveIndex(idx)}
                className={`absolute inset-0 rounded-2xl overflow-hidden border bg-neutral-900/90 shadow-2xl transition-all duration-700 ease-out cursor-pointer ${
                  isActive
                    ? "border-amber-400/80 ring-1 ring-amber-400/40 shadow-[0_10px_40px_rgba(251,191,36,0.2)]"
                    : "border-white/10 hover:border-white/30"
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Image background */}
                <div className="relative w-full h-full">
                  <OptimizedImage
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className={`object-cover transition-transform duration-700 ${
                      isActive ? "scale-105" : "scale-100 opacity-60"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                </div>

                {/* Top Location Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                    {slide.city}
                  </span>
                  <div className="h-7 w-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Card Title Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end space-y-1 z-10">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                    {slide.location}
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-white leading-tight">
                    {slide.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Button Controls & Progress Bar */}
      <div className="w-full max-w-md flex items-center justify-between px-4 pt-2">
        
        {/* Navigation Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="p-3 rounded-full border border-white/15 bg-neutral-900/90 text-white hover:border-amber-400 hover:text-amber-400 hover:scale-105 transition-all shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="p-3 rounded-full border border-white/15 bg-neutral-900/90 text-white hover:border-amber-400 hover:text-amber-400 hover:scale-105 transition-all shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Dots */}
        <div className="flex items-center space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === activeIndex ? "w-8 bg-amber-400" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Active City & Counter Readout */}
        <div className="flex items-center space-x-2 font-mono text-xs text-neutral-400">
          <span className="text-amber-400 font-bold">0{activeIndex + 1}</span>
          <span>/</span>
          <span>0{count}</span>
        </div>
      </div>

      {/* Active Slide Subtitle Caption */}
      <div className="text-center max-w-md px-4">
        <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed animate-fadeIn">
          <span className="text-amber-400 font-semibold uppercase font-mono mr-2">
            {activeSlide.city}:
          </span>
          {activeSlide.subtitle}
        </p>
      </div>

    </div>
  );
}
