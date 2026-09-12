"use client";

import React, { useEffect, useRef, useState } from "react";
import OptimizedImage from "../ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { CATEGORY_SCENES } from "./section-three/categoryScenes";
import {
  useCategoryScroll,
  getCardTransform,
  getCategoryVisibility,
} from "./section-three/useCategoryScroll";
import type {
  CardConfig,
  MobileCardConfig,
} from "./section-three/categoryScenes";

/** Desktop reference width the `card.width/height` px values were designed
 *  against. Cards scale fluidly between ~55% and 100% of that as the
 *  viewport narrows, and are swapped for a dedicated mobile layout below
 *  the MOBILE_BREAKPOINT instead of just shrinking further. */
const DESKTOP_REFERENCE_WIDTH = 1440;
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

function fluidPx(px: number) {
  const vw = (px / DESKTOP_REFERENCE_WIDTH) * 100;
  const min = px * 0.55;
  return `clamp(${min}px, ${vw.toFixed(3)}vw, ${px}px)`;
}

function Card({
  card,
  raw,
}: {
  card: CardConfig | MobileCardConfig;
  raw: number;
}) {
  const t = getCardTransform(raw, card);

  return (
    <div
      className="absolute will-change-transform"
      style={{
        top: `${card.top}%`,
        left: `${card.left}%`,
        width: fluidPx(card.width),
        aspectRatio: `${card.width} / ${card.height}`,
        zIndex: card.layer === "front" ? 30 : 5,
        opacity: t.opacity,
        transform: `translate3d(calc(-50% + ${t.x}px), calc(-50% + ${t.y}px), 0) rotate(${t.rotate}deg) scale(${t.scale})`,
        pointerEvents: t.opacity > 0.5 ? "auto" : "none",
      }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-md shadow-2xl shadow-black/40">
        <OptimizedImage
          src={card.src}
          alt={card.alt}
          fill
          sizes="(max-width: 767px) 45vw, 25vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}

export default function SectionThree() {
  const stageRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { segment, activeIndex, jumpToCategory } = useCategoryScroll(stageRef);

  return (
    <div
      ref={stageRef}
      className="relative w-full h-full overflow-hidden"
      data-testid="section-three-stage"
    >
      {/* Category pill nav — highlights whichever category is currently
          centered in the scroll window; click to jump straight to it. */}
      <nav className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-40 flex flex-wrap justify-center gap-2 px-4 max-w-[90%]">
        {CATEGORY_SCENES.map((scene, i) => (
          <button
            key={scene.id}
            onClick={() => jumpToCategory(i)}
            className={cn(
              "px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors duration-300",
              i === activeIndex
                ? "bg-white text-black border-white"
                : "bg-black/20 text-white/80 border-white/25 hover:border-white/50"
            )}
          >
            {scene.label}
          </button>
        ))}
      </nav>

      {CATEGORY_SCENES.map((scene, i) => {
        const raw = segment - i;
        // Skip rendering categories far outside the viewport window for
        // perf — keeps only the outgoing/incoming pair mounted.
        if (raw < -1.1 || raw > 1.1) return null;

        const visibility = getCategoryVisibility(raw);
        const cards = isMobile ? scene.mobileCards : scene.cards;

        return (
          <div
            key={scene.id}
            className="absolute inset-0"
            style={{
              backgroundColor: scene.background,
              opacity: visibility,
              zIndex: 10 + i,
            }}
          >
            {/* Back-layer cards: sit behind the big word */}
            {cards
              .filter((c) => c.layer === "back")
              .map((c) => (
                <Card key={c.id} card={c} raw={raw} />
              ))}

            {/* Big category word */}
            <div
              className="absolute inset-x-0 bottom-[6%] sm:bottom-[8%] px-[4%] sm:px-[5%]"
              style={{ zIndex: 20 }}
            >
              <h2
                className="font-sans font-extrabold leading-[0.85] tracking-tight select-none"
                style={{
                  color: scene.textColor,
                  fontSize: "clamp(3.5rem, 11vw, 10.5rem)",
                  opacity: visibility,
                  transform: `translateY(${(1 - visibility) * 24}px)`,
                }}
              >
                {scene.word}
              </h2>
            </div>

            {/* Front-layer cards: sit above the big word */}
            {cards
              .filter((c) => c.layer === "front")
              .map((c) => (
                <Card key={c.id} card={c} raw={raw} />
              ))}
          </div>
        );
      })}
    </div>
  );
}