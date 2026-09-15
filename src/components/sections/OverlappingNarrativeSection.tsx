"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import OptimizedImage from "../ui/OptimizedImage";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { clamp01, useSceneScroll } from "./section-three/useCategoryScroll";

interface CarouselItem {
  id: string;
  image: string;
  alt: string;
  tag: string;
  title: string;
}

const items: CarouselItem[] = [
  { id: "01", image: "/images/3dCorousal/home3.jpeg", alt: "Online Journey", tag: "Online Journey", title: "Online Journey" },
  { id: "02", image: "/images/3dCorousal/home2.jpg", alt: "Live Events", tag: "Live Events", title: "Live Events" },
  { id: "03", image: "/images/3dCorousal/home1.jpg", alt: "Life Mentoring", tag: "Life Mentoring", title: "Life Mentoring" },
  { id: "04", image: "/images/3dCorousal/home3.jpeg", alt: "Online Journey", tag: "Online Journey", title: "Online Journey" },
  { id: "05", image: "/images/3dCorousal/home2.jpg", alt: "Live Events", tag: "Live Events", title: "Live Events" },
  { id: "06", image: "/images/3dCorousal/home1.jpg", alt: "Life Mentoring", tag: "Life Mentoring", title: "Life Mentoring" },
  { id: "07", image: "/images/3dCorousal/home3.jpeg", alt: "Online Journey", tag: "Online Journey", title: "Online Journey" },
  { id: "08", image: "/images/3dCorousal/home2.jpg", alt: "Live Events", tag: "Live Events", title: "Live Events" },
  { id: "09", image: "/images/3dCorousal/home1.jpg", alt: "Life Mentoring", tag: "Life Mentoring", title: "Life Mentoring" },
  { id: "10", image: "/images/3dCorousal/home3.jpeg", alt: "Online Journey", tag: "Online Journey", title: "Online Journey" },
  { id: "11", image: "/images/3dCorousal/home2.jpg", alt: "Live Events", tag: "Live Events", title: "Live Events" },
  { id: "12", image: "/images/3dCorousal/home1.jpg", alt: "Life Mentoring", tag: "Life Mentoring", title: "Life Mentoring" },
];

const TOTAL = items.length;
const ANGLE_STEP = 360 / TOTAL;

/**
 * Extra scroll runway (in vh) given to the WHOLE carousel, on top of the
 * 100vh it needs to be pinned/visible for. Spread across the TOTAL-1 steps
 * between the first and last card, this is the distance the ring gets to
 * rotate through before Section 3 is allowed to slide up and cover it —
 * the same "tall wrapper + sticky panel" pattern SectionThree uses via
 * CARD_SCROLL_VH, just owned locally here since this section isn't part of
 * that category list. Raise this to make the scroll-through-cards feel
 * slower/longer; lower it for a snappier cycle.
 */
const SECTION_SCROLL_VH = 320;

const titleVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? 44 : -44, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? -44 : 44, opacity: 0 }),
};

export default function OverlappingNarrativeSection() {
  const { lenis } = useSmoothScroll();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // raw runs 0 -> 1 across this section's own pinned scroll window. See
  // useSceneScroll (shared with SectionThree) for exactly how that window
  // is measured — "top top" -> "bottom bottom" of wrapperRef.
  const raw = useSceneScroll(wrapperRef);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // The ring's rotation is now driven 1:1 by scroll progress instead of by
  // click state — no spring, no lag — the same way getCardTransform ties
  // cards straight to `raw` elsewhere in this project. rotationStep runs
  // from 0 (first card centered, right as the section pins) to TOTAL-1
  // (last card centered, right before the pin releases and Section 3 slides
  // up over it exactly as it already does today).
  const rotationStep = clamp01(raw) * (TOTAL - 1);
  const activeIndex = Math.min(TOTAL - 1, Math.round(rotationStep));

  // Direction only decides which way the title swaps in/out. Tracked via a
  // ref (not state) for the comparison so it doesn't cause an extra render.
  const prevRawRef = useRef(0);
  const [direction, setDirection] = useState(1);
  useEffect(() => {
    setDirection(raw >= prevRawRef.current ? 1 : -1);
    prevRawRef.current = raw;
  }, [raw]);

  // Clicking a card, or the prev/next arrows, jumps the actual page scroll
  // position to that card's slice of the pin window — identical in spirit
  // to jumpToCategory in SectionThree — so the ring's rotation (driven by
  // `raw` above) animates there smoothly under Lenis rather than snapping.
  const goToCard = useCallback(
    (index: number) => {
      const el = wrapperRef.current;
      if (!el || !lenis) return;
      const clamped = Math.min(TOTAL - 1, Math.max(0, index));
      const target =
        el.offsetTop + (clamped / (TOTAL - 1)) * (el.offsetHeight - window.innerHeight);
      lenis.scrollTo(target, { duration: 1.1 });
    },
    [lenis]
  );

  const goNext = useCallback(() => goToCard(activeIndex + 1), [activeIndex, goToCard]);
  const goPrev = useCallback(() => goToCard(activeIndex - 1), [activeIndex, goToCard]);

  // Smaller overall stage, and radius brought back down closer to cardWidth
  // so the gaps between front-row cards aren't too extreme.
  const radius = isMobile ? 320 : 620;
  const cardWidth = isMobile ? 140 : 240;
  const cardHeight = isMobile ? 200 : 360;

  return (
    // Tall, non-sticky wrapper — this is what gives the section real scroll
    // distance to consume. The sticky panel inside pins for exactly
    // SECTION_SCROLL_VH of scrolling, then releases, letting Section 3
    // slide up and cover it precisely as before.
    <div
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: `calc(100vh + ${SECTION_SCROLL_VH}vh)` }}
    >
      <div className="sticky top-[48px] sm:top-[64px] md:top-[80px] z-10 h-[calc(100vh-48px)] sm:h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] w-full bg-neutral-950 text-white flex flex-col items-center justify-center overflow-hidden py-8 sm:py-10">
        {/* 3D Carousel Stage */}
        <div
          className="relative w-full flex-1 flex items-center justify-center"
          style={{ perspective: "1600px" }}
        >
          {/* Rotating ring — driven directly by rotationStep (no spring),
              so it tracks scroll position exactly, the same way every other
              scroll-linked transform in this project avoids fighting
              Lenis's own smoothing with a competing animation curve. Each
              card underneath has a FIXED rotateY + translateZ that places
              it at its own position around the ring; real 3D perspective
              (not a manual sine approximation) naturally pushes receding
              cards outward and behind, so they peek through the gaps
              instead of hiding flush behind the front row. */}
          <div
            className="relative"
            style={{
              width: cardWidth,
              height: cardHeight,
              transformStyle: "preserve-3d",
              transform: `rotateY(${-rotationStep * ANGLE_STEP}deg)`,
            }}
          >
            {items.map((item, index) => {
              const fixedAngle = index * ANGLE_STEP;
              return (
                <div
                  key={item.id}
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl cursor-pointer border border-white/10"
                  style={{
                    transform: `rotateY(${fixedAngle}deg) translateZ(${radius}px)`,
                    // "visible" (not "hidden") lets cards on the far side of
                    // the ring keep rendering as they rotate past
                    // 90/180deg — since the face is flipped, it reads as a
                    // mirrored reflection showing through the gaps of the
                    // front-row cards instead of just vanishing.
                    backfaceVisibility: "visible",
                  }}
                  onClick={() => goToCard(index)}
                >
                  <OptimizedImage
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>

          {/* Center title + CTA overlay, always pinned above the ring.
              Slides bottom-to-top on "next", top-to-bottom on "prev". */}
          <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden pointer-events-none px-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={items[activeIndex].id}
                custom={direction}
                variants={titleVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
                className="flex flex-col items-center gap-6 sm:gap-8"
              >
                <h3 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white text-center drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                  {items[activeIndex].title}
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Prev / Next controls — now jump scroll position rather than
            local state, so the ring's animation stays tied to `raw`. */}
        <div className="flex items-center gap-4 mt-2 sm:mt-10 z-30">
          <button
            aria-label="Previous"
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-lime-400 hover:bg-lime-300 disabled:opacity-30 disabled:hover:bg-lime-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <button
            aria-label="Next"
            onClick={goNext}
            disabled={activeIndex === TOTAL - 1}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-lime-400 hover:bg-lime-300 disabled:opacity-30 disabled:hover:bg-lime-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}