"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════════════════════
 *  PAST CLIENTS — one gallery band of brand images on the original dark
 *  luxury backdrop. Nothing moves on its own: if the cards don't all fit, the
 *  band scrolls sideways by swipe / trackpad / mouse-drag / arrow buttons,
 *  with a thin gold progress line underneath.
 *
 *  TO EDIT: add / remove entries in BRANDS below (image path is under /public).
 * ═══════════════════════════════════════════════════════════════════════════ */

interface BrandItem {
  id: string;
  name: string;
  category: string;
  image: string;
}

const BRANDS: BrandItem[] = [
  { id: "1", name: "Rolex", category: "Haute Horlogerie", image: "/images/brands/brand-4.jpg" },
  { id: "2", name: "Hermès", category: "La Maison", image: "/images/brands/brand-2.jpg" },
  { id: "3", name: "Ferrari", category: "Scuderia Maranello", image: "/images/brands/brand-3.jpg" },
  { id: "4", name: "Chanel", category: "Haute Couture", image: "/images/brands/brand-1.jpg" },
  { id: "5", name: "Cartier", category: "Haute Joaillerie", image: "/images/brands/brand-5.jpg" },
  { id: "6", name: "Porsche", category: "Motorsport Stuttgart", image: "/images/brands/brand-6.jpg" },
];

/** How long the section stays pinned while scrolling past (vh). Must stay
 *  >= 100: the next section slides up with -mt-[100vh] (see page.tsx), so
 *  anything smaller makes it cover this one before it is even pinned. */
const SECTION_SCROLL_VH = 120;

const pad = (n: number) => String(n).padStart(2, "0");

export default function BrandShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const [shown, setShown] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [progress, setProgress] = useState(0);
  const [overflowing, setOverflowing] = useState(false);

  // One-time staggered reveal when the section first comes into view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflowing(max > 4);
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const w = card ? card.offsetWidth : el.clientWidth * 0.6;
    el.scrollBy({ left: dir * w * 1.5, behavior: "smooth" });
  };

  // Mouse drag-to-scroll (touch / trackpad already scroll natively).
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !overflowing) return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = trackRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) {
      d.moved = true;
      el.style.scrollSnapType = "none";
    }
    el.scrollLeft = d.startScroll - dx;
  };
  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (trackRef.current) trackRef.current.style.scrollSnapType = "";
  };

  return (
    <div
      ref={rootRef}
      className="relative w-full"
      style={{ height: `calc(100vh + ${SECTION_SCROLL_VH}vh)` }}
    >
      <div className="sticky top-[48px] sm:top-[64px] md:top-[80px] z-10 h-[calc(100vh-48px)] sm:h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] w-full bg-[#08080a] overflow-hidden select-none flex flex-col items-center justify-between py-4 sm:py-6 md:py-8">
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

        {/* ── Ambient Warm Gold Spotlight ── */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] pointer-events-none rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(226,194,117,0.08) 0%, rgba(217,119,6,0.025) 40%, transparent 70%)",
          }}
        />

        {/* ── Section Header ── */}
        <div
          className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center"
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? "none" : "translateY(16px)",
            transition: "opacity 800ms ease, transform 800ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-0.5 sm:py-1 rounded-full border border-amber-500/20 bg-neutral-950/80 mb-2 sm:mb-3">
            <span className="text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-amber-300/80 font-mono font-medium">
              A Curation of Excellence
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200 leading-tight">
            PAST CLIENTS
          </h2>

          <p className="mt-2 text-[11px] sm:text-xs md:text-sm text-neutral-400 font-light tracking-widest max-w-lg">
            Preeminent artisans, horologers, and marques shaping the modern vanguard.
          </p>
        </div>

        {/* ── The band ── */}
        <div className="relative z-10 w-full max-w-7xl flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12">
          <div className="relative">
            <div
              ref={trackRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              className={`brand-band flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto py-4 ${overflowing ? "cursor-grab active:cursor-grabbing" : ""
                }`}
              style={{
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                justifyContent: "safe center",
              }}
            >
              {BRANDS.map((brand, i) => (
                <BrandCard key={brand.id} brand={brand} index={i} shown={shown} />
              ))}
            </div>

            {canLeft && (
              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-20 bg-gradient-to-r from-[#08080a] to-transparent z-20" />
            )}
            {canRight && (
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-20 bg-gradient-to-l from-[#08080a] to-transparent z-20" />
            )}
          </div>

          {/* ── Controls + progress (always visible) ── */}
          <div className="mt-5 flex items-center gap-4">
            <div className="relative h-px flex-1 bg-white/10">
              <div
                className="absolute inset-y-[-0.5px] left-0 h-[2px] bg-gradient-to-r from-amber-300/60 to-amber-200"
                style={{
                  width: overflowing ? `${Math.max(8, progress * 100)}%` : "100%",
                  transition: "width 150ms linear",
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <RoundArrow dir="left" disabled={!canLeft} onClick={() => step(-1)} />
              <RoundArrow dir="right" disabled={!canRight} onClick={() => step(1)} />
            </div>
          </div>
        </div>

        {/* ── Footer status ── */}
        <div className="relative z-20 text-center px-4 flex items-center justify-center gap-4 text-[10px] sm:text-xs text-neutral-500 font-mono tracking-[0.25em] uppercase">
          <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-500/30" />
          <span>Curated Brand Showcase</span>
          <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-500/30" />
        </div>

        {/* ── Top / bottom depth fade ── */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#08080a] to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#08080a] to-transparent pointer-events-none z-20" />

        <style dangerouslySetInnerHTML={{ __html: `.brand-band::-webkit-scrollbar { display: none; }` }} />
      </div>
    </div>
  );
}

function BrandCard({ brand, index, shown }: { brand: BrandItem; index: number; shown: boolean }) {
  // Cursor-following gold spotlight inside the card.
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      data-card
      onMouseMove={onMove}
      className="group relative shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-amber-500/20 bg-[#101117] transition-[border-color,box-shadow] duration-300 hover:border-amber-400/60 hover:shadow-[0_18px_40px_rgba(0,0,0,0.8),0_0_24px_rgba(226,194,117,0.15)]"
      style={{
        width: "clamp(230px, 26vw, 340px)",
        height: "clamp(260px, 46vh, 430px)",
        scrollSnapAlign: "start",
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(28px)",
        transition: `opacity 700ms ease ${200 + index * 90}ms, transform 900ms cubic-bezier(0.22,1,0.36,1) ${200 + index * 90}ms, border-color 300ms, box-shadow 300ms`,
      }}
    >
      <Image
        src={brand.image}
        alt={brand.name}
        fill
        sizes="(max-width: 768px) 230px, 340px"
        draggable={false}
        priority={index < 4}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
      />

      {/* luxury gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0e] via-[#090a0e]/30 to-black/10 transition-colors duration-300 group-hover:via-[#090a0e]/10" />

      {/* gold spotlight following the cursor */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(226,194,117,0.18), transparent 70%)",
        }}
      />

      {/* index */}
      <span className="absolute left-4 top-4 font-mono text-[10px] tabular-nums tracking-[0.25em] text-amber-200/70">
        {pad(index + 1)}
      </span>

      {/* identity badge */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex items-end justify-between z-10">
        <div>
          <span className="block font-mono text-[8px] sm:text-[9px] tracking-[0.22em] text-amber-300/80 uppercase leading-none mb-1.5">
            {brand.category}
          </span>
          <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-wider leading-tight">
            {brand.name}
          </h3>
          <span className="mt-2 block h-px w-0 bg-amber-300/80 transition-all duration-500 ease-out group-hover:w-10" />
        </div>
        <span className="text-[9px] text-amber-400/60 transition-colors group-hover:text-amber-300">◆</span>
      </div>
    </div>
  );
}

function RoundArrow({
  dir,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Scroll brands left" : "Scroll brands right"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 text-amber-200 transition duration-300 hover:bg-amber-200 hover:text-neutral-900 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-amber-200"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dir === "left" ? <path d="M19 12H5M11 6l-6 6 6 6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
      </svg>
    </button>
  );
}