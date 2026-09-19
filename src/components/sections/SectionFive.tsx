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
    title: string;
}

/** Reuses the same source images as Section 2's ring — swap paths/titles
 *  here as needed once real closing-section imagery is available. */
const items: CarouselItem[] = [
    { id: "01", image: "/images/founder/founder.jpg", alt: "Gregorio Avanzini", title: "Gregorio Avanzini" },
    { id: "02", image: "/images/3dCorousal/home3.jpeg", alt: "Online Journey", title: "Online Journey" },
    { id: "03", image: "/images/3dCorousal/home2.jpg", alt: "Live Events", title: "Live Events" },
    { id: "04", image: "/images/3dCorousal/home1.jpg", alt: "Life Mentoring", title: "Life Mentoring" },
    { id: "05", image: "/images/brands/brand-1.jpg", alt: "Featured", title: "Featured" },
];

const TOTAL = items.length;
const ANGLE_STEP = 360 / TOTAL;

/**
 * Extra scroll runway (in vh) given to this ring on top of the 100vh it
 * needs to be pinned/visible for. Same "tall wrapper + sticky panel"
 * pattern as Section 2 (SECTION_SCROLL_VH there) and Section 3
 * (CARD_SCROLL_VH) — scaled down from Section 2's 1000vh in proportion to
 * this ring having half as many cards (6 vs 12), so the per-card scroll
 * distance feels the same. Rotation is driven 1:1 by scroll progress via
 * useSceneScroll below — no locking, no stepping, no cooldown — exactly
 * like every other scroll-linked ring in this project.
 */
const SECTION_SCROLL_VH = 480;

/** Cumulative height of the 5 stacked sticky headers (GREGORIO top/bottom +
 *  WORLD top/bottom + BEYOND) this panel sits below, per breakpoint. Keep
 *  these in sync with the header bar heights in page.tsx (48/64/80px each). */
const HEADER_STACK_CLASS = {
    top: "top-[240px] sm:top-[320px] md:top-[400px]",
    height: "h-[calc(100vh-240px)] sm:h-[calc(100vh-320px)] md:h-[calc(100vh-400px)]",
};

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    return isMobile;
}

export default function SectionFive() {
    const { lenis } = useSmoothScroll();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    // raw runs 0 -> 1 across this section's own pinned scroll window —
    // identical mechanism to Section 2's ring (see useSceneScroll).
    const raw = useSceneScroll(wrapperRef);

    // Ring rotation driven 1:1 by scroll progress, no spring/lag — same as
    // Section 2's rotationStep. rotationStep runs from 0 (first card
    // centered, right as the panel pins) to TOTAL-1 (last card centered,
    // right before the pin releases).
    const rotationStep = clamp01(raw) * (TOTAL - 1);
    const activeIndex = Math.min(TOTAL - 1, Math.round(rotationStep));

    const prevRawRef = useRef(0);
    const [direction, setDirection] = useState(1);
    useEffect(() => {
        if (Math.abs(raw - prevRawRef.current) > 0.002) {
            const nextDir = raw > prevRawRef.current ? 1 : -1;
            setDirection((prev) => (prev !== nextDir ? nextDir : prev));
            prevRawRef.current = raw;
        }
    }, [raw]);

    // Clicking a card, or the prev/next arrows, jumps the actual page
    // scroll position to that card's slice of the pin window — identical in
    // spirit to goToCard in Section 2 — so the ring's rotation (driven by
    // `raw` above) animates there smoothly under Lenis rather than snapping.
    const goTo = useCallback(
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

    // Smaller stage than Section 2's full-viewport ring — sized to comfortably
    // sit inside the existing card body rather than take over the screen.
    const radius = isMobile ? 190 : 340;
    const cardWidth = isMobile ? 120 : 190;
    const cardHeight = isMobile ? 170 : 270;
    const stageHeight = isMobile ? 240 : 360;

    return (
        // Tall, non-sticky wrapper — gives the section real scroll distance
        // to consume. The sticky panel inside pins for exactly
        // SECTION_SCROLL_VH of scrolling, then releases; since this is the
        // last section on the page, nothing needs to slide up over it
        // afterward, so the page simply ends once the pin releases.
        <div
            ref={wrapperRef}
            className="relative w-full"
            style={{ height: `calc(100vh + ${SECTION_SCROLL_VH}vh)` }}
        >
            <div
                className={`sticky ${HEADER_STACK_CLASS.top} z-10 ${HEADER_STACK_CLASS.height} w-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden`}
            >
                <div
                    className="relative w-full flex items-center justify-center"
                    style={{ perspective: "1400px", height: stageHeight }}
                >
                    {/* Rotating ring — driven directly by rotationStep (no
                        spring, no CSS transition), so it tracks scroll
                        position exactly, the same way Section 2's ring does. */}
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
                                    className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl cursor-pointer border border-white/10"
                                    style={{
                                        transform: `rotateY(${fixedAngle}deg) translateZ(${radius}px)`,
                                        backfaceVisibility: "visible",
                                    }}
                                    onClick={() => goTo(index)}
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

                    {/* Title overlay, same slide-swap pattern as Section 2 */}
                    <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-center overflow-hidden pointer-events-none px-4 pb-1">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.h4
                                key={items[activeIndex].id}
                                custom={direction}
                                initial={{ y: direction > 0 ? 20 : -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: direction > 0 ? -20 : 20, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
                                className="font-sans text-base sm:text-lg font-bold uppercase tracking-tight text-white text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                            >
                                {items[activeIndex].title}
                            </motion.h4>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                    <button
                        aria-label="Previous"
                        onClick={() => goTo(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-lime-400 hover:bg-lime-300 disabled:opacity-30 disabled:hover:bg-lime-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-black" />
                    </button>
                    <button
                        aria-label="Next"
                        onClick={() => goTo(activeIndex + 1)}
                        disabled={activeIndex === TOTAL - 1}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-lime-400 hover:bg-lime-300 disabled:opacity-30 disabled:hover:bg-lime-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-black" />
                    </button>
                </div>
            </div>
        </div>
    );
}