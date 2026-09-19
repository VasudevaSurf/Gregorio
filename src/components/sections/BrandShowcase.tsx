"use client";

import React from "react";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════════════════════
 *  PAST CLIENTS / BRAND SHOWCASE — 3-TIER LUXURY IMAGE EXHIBITION
 *  Static (non-scrolling) brand image grid across 3 rows, so every logo
 *  stays visible on screen rather than cycling through a marquee.
 * ═══════════════════════════════════════════════════════════════════════════ */

interface BrandItem {
  id: string;
  name: string;
  category: string;
  image: string;
}

const ROW_ONE: BrandItem[] = [
  { id: "1", name: "Rolex", category: "Haute Horlogerie", image: "/images/brands/brand-4.jpg" },
  { id: "2", name: "Hermès", category: "La Maison", image: "/images/brands/brand-2.jpg" },
  { id: "3", name: "Ferrari", category: "Scuderia Maranello", image: "/images/brands/brand-3.jpg" },
  { id: "4", name: "Chanel", category: "Haute Couture", image: "/images/brands/brand-1.jpg" },
  { id: "5", name: "Cartier", category: "Haute Joaillerie", image: "/images/brands/brand-5.jpg" },
  { id: "6", name: "Porsche", category: "Motorsport Stuttgart", image: "/images/brands/brand-6.jpg" },
];

const ROW_TWO: BrandItem[] = [
  { id: "7", name: "Louis Vuitton", category: "Malletier Paris", image: "/images/brands/brand-7.jpg" },
  { id: "8", name: "Aston Martin", category: "British Marque", image: "/images/brands/brand-8.jpg" },
  { id: "9", name: "Dom Pérignon", category: "Vintage Champagne", image: "/images/brands/brand-9.jpg" },
  { id: "10", name: "Bugatti", category: "Atelier Hypercar", image: "/images/brands/brand-10.jpg" },
  { id: "11", name: "Tiffany & Co.", category: "High Jewelry", image: "/images/brands/brand-11.jpg" },
  { id: "12", name: "Patek Philippe", category: "Grandes Complications", image: "/images/brands/brand-12.jpg" },
];

const ROW_THREE: BrandItem[] = [
  { id: "13", name: "Lamborghini", category: "Supercars Sant'Agata", image: "/images/brands/brand-3.jpg" },
  { id: "14", name: "Audemars Piguet", category: "Le Brassus", image: "/images/brands/brand-4.jpg" },
  { id: "15", name: "Dior", category: "Haute Couture", image: "/images/brands/brand-1.jpg" },
  { id: "16", name: "Rolls-Royce", category: "Bespoke Motor Cars", image: "/images/brands/brand-8.jpg" },
  { id: "17", name: "Vacheron Constantin", category: "Haute Horlogerie", image: "/images/brands/brand-12.jpg" },
  { id: "18", name: "Balenciaga", category: "Couture Paris", image: "/images/brands/brand-7.jpg" },
];

const SECTION_SCROLL_VH = 120;

export default function BrandShowcase() {
  return (
    <div
      className="relative w-full"
      style={{ height: `calc(100vh + ${SECTION_SCROLL_VH}vh)` }}
    >
      <div className="sticky top-[48px] sm:top-[64px] md:top-[80px] z-10 h-[calc(100vh-48px)] sm:h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] w-full bg-[#08080a] overflow-hidden select-none flex flex-col justify-between py-4 sm:py-6 md:py-8">
        {/* ── Background Architectural Grid ── */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* ── Subtle Ambient Warm Gold Spotlight (Static, Zero-JS) ── */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(226,194,117,0.06) 0%, rgba(217,119,6,0.02) 40%, transparent 70%)",
          }}
        />

        {/* ── Section Header ── */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 sm:py-1 rounded-full border border-amber-500/20 bg-neutral-950/80 mb-1.5 sm:mb-2">
            <span className="text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-amber-300/80 font-mono font-medium">
              A Curation of Excellence
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200 leading-tight">
            PAST CLIENTS
          </h2>

          <p className="mt-1 text-[11px] sm:text-xs md:text-sm text-neutral-400 font-light tracking-widest max-w-lg">
            Preeminent artisans, horologers, and marques shaping the modern vanguard.
          </p>
        </div>

        {/* ── Static Brand Gallery (no auto-scroll) ── */}
        <div className="relative z-10 w-full flex-1 flex flex-col justify-center gap-2.5 sm:gap-3.5 md:gap-4 my-auto py-1">
          <BrandImageRow items={ROW_ONE} />
          <BrandImageRow items={ROW_TWO} />
          <BrandImageRow items={ROW_THREE} />
        </div>

        {/* ── Section Footer Status ── */}
        <div className="relative z-20 text-center px-4 flex items-center justify-center gap-4 text-[10px] sm:text-xs text-neutral-500 font-mono tracking-[0.25em] uppercase">
          <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-500/30" />
          <span>Curated Brand Showcase</span>
          <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-500/30" />
        </div>

        {/* ── Edge Vignettes (Smooth Depth Fade) ── */}
        <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-r from-[#08080a] to-transparent pointer-events-none z-20" />
        <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-l from-[#08080a] to-transparent pointer-events-none z-20" />
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#08080a] to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#08080a] to-transparent pointer-events-none z-20" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  BrandImageRow Component — Static Wrapped Row
 * ═══════════════════════════════════════════════════════════════════════════ */

interface BrandImageRowProps {
  items: BrandItem[];
}

function BrandImageRow({ items }: BrandImageRowProps) {
  return (
    <div className="relative w-full">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5">
        {items.map((brand, idx) => (
          <div
            key={brand.id}
            className="brand-card-item flex-shrink-0"
            style={{
              width: "clamp(180px, 18vw, 250px)",
              height: "clamp(88px, 11.5vh, 125px)",
            }}
          >
            <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden border border-amber-500/20 bg-[#101117] transition-all duration-300 hover:border-amber-400/60 hover:shadow-[0_12px_28px_rgba(0,0,0,0.8),0_0_20px_rgba(226,194,117,0.15)] group cursor-pointer transform-gpu hover:scale-[1.03]">
              {/* Brand Image Display */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 768px) 180px, 250px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={idx < 6}
                />
                {/* Sleek luxury gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090a0e] via-[#090a0e]/40 to-black/20 group-hover:via-[#090a0e]/20 transition-colors duration-300" />
              </div>

              {/* Bottom Card Identity Badge */}
              <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 flex items-end justify-between z-10">
                <div>
                  <span className="text-[6.5px] sm:text-[7.5px] font-mono tracking-[0.2em] text-amber-300/80 uppercase block leading-none mb-0.5">
                    {brand.category}
                  </span>
                  <h3 className="font-serif text-xs sm:text-sm font-bold text-white tracking-wider leading-tight">
                    {brand.name}
                  </h3>
                </div>
                <span className="text-[7px] text-amber-400/60 group-hover:text-amber-300 transition-colors">
                  ◆
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}