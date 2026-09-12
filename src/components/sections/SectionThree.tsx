"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { CATEGORY_SCENES } from "./section-three/categoryScenes";
import {
  useSceneScroll,
  getCardTransform,
  clamp01,
  CARD_SCROLL_VH,
} from "./section-three/useCategoryScroll";
import type { CardConfig, MobileCardConfig } from "./section-three/categoryScenes";

const DESKTOP_REFERENCE_WIDTH = 1440;
const MOBILE_BREAKPOINT = 768;
const CARD_SPREAD = 0.78;

/** How much of each category's own slice of the timeline (at the very
 *  start / end) is used to crossfade into / out of its neighbour. Bigger
 *  = slower, more peaceful transition. */
const CROSSFADE_FRACTION = 0.32;

/** How much each card's own fade is staggered relative to its siblings,
 *  as a fraction of the group's fade window. Cards ease in one after
 *  another instead of all popping to full opacity together — this is
 *  what removes the "white splash" of 4 white cards appearing at once. */
const CARD_STAGGER = 0.16;

/** Smoothstep easing: slow-fast-slow instead of linear, for a gentler feel. */
function ease(x: number) {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}

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

function pulledIn(pct: number) {
  return 50 + (pct - 50) * CARD_SPREAD;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const bigint = parseInt(full, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function mixColors(a: string, b: string, t: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bch = Math.round(ca.b + (cb.b - ca.b) * t);
  return `rgb(${r}, ${g}, ${bch})`;
}

/**
 * Remaps a category-wide `groupPresence` (0..1) into a per-card presence
 * that starts its own ramp slightly later than the card before it, so a
 * scene's 4 cards ease in/out as a soft cascade rather than snapping to
 * full opacity simultaneously.
 */
function staggeredPresence(groupPresence: number, index: number, total: number) {
  const offset = index * CARD_STAGGER;
  const span = Math.max(0.001, 1 - (total - 1) * CARD_STAGGER);
  const local = clamp01((groupPresence - offset) / span);
  return ease(local);
}

/**
 * One testimonial card. Position/rotation/drift still come from
 * getCardTransform (unchanged motion logic) — `presence` now drives this
 * card's own opacity + a subtle scale-in, independent of its siblings.
 */
function TestimonialCard({
  card,
  raw,
  presence,
  avatarColor,
}: {
  card: CardConfig | MobileCardConfig;
  raw: number;
  presence: number;
  avatarColor: string;
}) {
  const t = getCardTransform(raw, card);
  // Gentle scale-in from 0.92 -> 1 alongside the opacity fade, so cards
  // arrive softly instead of just blinking into existence.
  const arrivalScale = 0.92 + presence * 0.08;

  return (
    <div
      className="absolute will-change-transform"
      style={{
        top: `${pulledIn(card.top)}%`,
        left: `${pulledIn(card.left)}%`,
        width: fluidPx(card.width),
        zIndex: card.layer === "front" ? 30 : 5,
        opacity: presence,
        transform: `translate3d(calc(-50% + ${t.x}px), calc(-50% + ${t.y}px), 0) rotate(${t.rotate}deg) scale(${t.scale * arrivalScale})`,
        pointerEvents: presence > 0.5 ? "auto" : "none",
      }}
    >
      <div className="rounded-2xl bg-white shadow-2xl shadow-black/40 p-5 sm:p-6 flex gap-4 items-start">
        {/* Swap this div for <OptimizedImage src={card.avatarSrc} .../> once real avatar photos are ready */}
        <div
          className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {card.avatarInitials}
        </div>
        <div className="min-w-0">
          <p
            className="font-serif text-[11px] sm:text-[13px] leading-snug text-neutral-900"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            <span className="font-bold not-italic">'{card.headline}</span>{" "}
            <span className="italic font-normal text-neutral-700">{card.body}'</span>
          </p>
          <p className="mt-3 text-[11px] sm:text-sm font-bold text-neutral-900 truncate">
            {card.name}
          </p>
          <p className="text-[8px] sm:text-[10px] tracking-wide uppercase text-neutral-500 leading-snug">
            {card.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SectionThree() {
  const isMobile = useIsMobile();
  const { lenis } = useSmoothScroll();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const count = CATEGORY_SCENES.length;
  const totalScrollVh = count * CARD_SCROLL_VH;

  // ONE continuous progress value across the whole section — keeps the
  // background a single pinned surface instead of re-pinning panels.
  const raw = useSceneScroll(wrapperRef);

  const segments = useMemo(() => {
    return CATEGORY_SCENES.map((_, i) => {
      const segStart = i / count;
      const segSize = 1 / count;
      const local = clamp01((raw - segStart) / segSize);
      const fadeIn = i === 0 ? 1 : clamp01(local / CROSSFADE_FRACTION);
      const fadeOut = i === count - 1 ? 1 : clamp01((1 - local) / CROSSFADE_FRACTION);
      return { local, presence: ease(Math.min(fadeIn, fadeOut)) };
    });
  }, [raw, count]);

  const activeIndex = Math.min(count - 1, Math.floor(raw * count));

  const jumpToCategory = (index: number) => {
    const el = wrapperRef.current;
    if (!el || !lenis) return;
    const target = el.offsetTop + (index / count) * (el.offsetHeight - window.innerHeight);
    lenis.scrollTo(target, { duration: 1.1 });
  };

  // Background is a single continuous color, eased through the same
  // crossfade window as the cards — no separate sliding panel, no pop.
  const background = useMemo(() => {
    const idx = activeIndex;
    const nextIdx = Math.min(count - 1, idx + 1);
    if (idx === nextIdx) return CATEGORY_SCENES[idx].background;
    const local = segments[idx].local;
    const transitionStart = 1 - CROSSFADE_FRACTION;
    if (local <= transitionStart) return CATEGORY_SCENES[idx].background;
    const w = ease(clamp01((local - transitionStart) / CROSSFADE_FRACTION));
    return mixColors(CATEGORY_SCENES[idx].background, CATEGORY_SCENES[nextIdx].background, w);
  }, [activeIndex, count, segments]);

  return (
    <div className="relative w-full">
      <nav className="sticky top-4 sm:top-6 z-40 flex flex-wrap justify-center gap-2 px-4">
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

      {/* ONE tall wrapper for the entire section — the sticky panel inside
          pins exactly once, so the background never slides or swaps. */}
      <div
        ref={wrapperRef}
        className="relative w-full"
        style={{ height: `${100 + totalScrollVh}vh` }}
      >
        <div
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{ backgroundColor: background }}
        >
          {CATEGORY_SCENES.map((scene, i) => {
            const seg = segments[i];
            if (seg.presence <= 0) return null;
            const cards = isMobile ? scene.mobileCards : scene.cards;

            return (
              <div
                key={scene.id}
                className="absolute inset-0"
                style={{ pointerEvents: i === activeIndex ? "auto" : "none" }}
              >
                {cards
                  .filter((c) => c.layer === "back")
                  .map((c, idx) => (
                    <TestimonialCard
                      key={c.id}
                      card={c}
                      raw={seg.local}
                      presence={staggeredPresence(seg.presence, idx, cards.length)}
                      avatarColor={scene.accent}
                    />
                  ))}

                <div
                  className="absolute inset-x-0 bottom-[6%] sm:bottom-[8%] px-[4%] sm:px-[5%]"
                  style={{ zIndex: 20, opacity: seg.presence }}
                >
                  <h2
                    className="font-sans font-extrabold leading-[0.85] tracking-tight select-none"
                    style={{ color: scene.textColor, fontSize: "clamp(3.5rem, 11vw, 10.5rem)" }}
                  >
                    {scene.word}
                  </h2>
                </div>

                {cards
                  .filter((c) => c.layer === "front")
                  .map((c, idx) => (
                    <TestimonialCard
                      key={c.id}
                      card={c}
                      raw={seg.local}
                      presence={staggeredPresence(seg.presence, idx, cards.length)}
                      avatarColor={scene.accent}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}