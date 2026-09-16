"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import OptimizedImage from "../ui/OptimizedImage";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

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
    { id: "05", image: "/images/3dCorousal/home3.jpeg", alt: "Online Journey", title: "Online Journey" },
    { id: "06", image: "/images/3dCorousal/home2.jpg", alt: "Live Events", title: "Live Events" },
];

const TOTAL = items.length;
const ANGLE_STEP = 360 / TOTAL;

/**
 * This section takes over scrolling completely instead of the earlier
 * "tall wrapper + sticky panel" trick (that approach still burns real
 * scroll distance — the page keeps moving underneath, which read as
 * excess empty space). Here the section sits at its normal, single-
 * viewport height (no added runway at all), and while it owns scrolling
 * Lenis is fully stopped — nothing on the page moves, only the ring
 * rotates. Only once the ring has been stepped all the way through does
 * the hold release and the page resumes scrolling normally.
 */

/** Matches the sticky-header offset convention used elsewhere in this
 *  project ("top-[60px]") — the scroll position at which this section is
 *  considered "in place" and allowed to take over. */
const HEADER_OFFSET = 60;

/** How close (in px) the section's pin edge has to get — checked every
 *  animation frame via Lenis's own "scroll" event, not just on discrete
 *  wheel ticks — before it's snapped exactly into place and the hold
 *  engages. A continuous per-frame check (rather than only reading
 *  whatever the next wheel tick happens to report) is what keeps a single
 *  fast flick from skipping straight past this window. */
const ENGAGE_EPSILON = 6;

/** How many px of wheel/touch delta count as one card step once this
 *  section owns scrolling. Raise for a bigger gesture per card, lower for
 *  snappier stepping. */
const STEP_DISTANCE = 90;

/** Minimum time (ms) between steps, so one fast flick or a single
 *  trackpad gesture can't fire through several cards at once. */
const STEP_COOLDOWN_MS = 480;

/** Small immediate scroll "kick", in the release direction, applied the
 *  instant the hold lets go — so the page visibly continues right away
 *  instead of the releasing gesture itself being spent with no visible
 *  effect and needing a second one just to notice it's free. */
const RELEASE_NUDGE = 32;

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
    const sectionRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    // Ref mirror of activeIndex — the scroll/wheel/touch handlers below are
    // registered once (not re-bound on every card change), so they read
    // this instead of a stale closed-over value.
    const activeIndexRef = useRef(0);
    useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    // True while this section owns scrolling outright: Lenis (and so the
    // whole page) is stopped dead, and raw wheel/touch input steps the
    // ring instead of moving anything at all.
    const lockedRef = useRef(false);
    const cooldownRef = useRef(false);
    const accumRef = useRef(0);
    const touchYRef = useRef<number | null>(null);

    const step = useCallback(
        (dir: 1 | -1) => {
            const next = activeIndexRef.current + dir;
            if (next < 0 || next > TOTAL - 1) {
                // Ring exhausted in this direction — hand scrolling back to
                // Lenis and give it a small immediate nudge so the page
                // visibly continues right away.
                lockedRef.current = false;
                lenis?.start();
                lenis?.scrollTo((lenis?.scroll ?? 0) + dir * RELEASE_NUDGE, {
                    immediate: true,
                });
                return;
            }
            if (cooldownRef.current) return;
            cooldownRef.current = true;
            activeIndexRef.current = next;
            setDirection(dir);
            setActiveIndex(next);
            window.setTimeout(() => {
                cooldownRef.current = false;
            }, STEP_COOLDOWN_MS);
        },
        [lenis]
    );

    // Continuously watch — via Lenis's own per-frame "scroll" event, fired
    // throughout its eased animation, not just on discrete wheel ticks —
    // for the moment this section's pin edge reaches HEADER_OFFSET while
    // scrolling down into it, or its bottom edge reaches the viewport
    // bottom while scrolling back up into it. The instant that happens,
    // snap it exactly into place and freeze everything.
    useEffect(() => {
        if (!lenis) return;

        const onScroll = () => {
            if (lockedRef.current) return;
            const el = sectionRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const dir = lenis.direction;

            const enteringDown =
                dir === 1 &&
                rect.top <= HEADER_OFFSET + ENGAGE_EPSILON &&
                activeIndexRef.current < TOTAL - 1;
            const enteringUp =
                dir === -1 &&
                rect.bottom >= window.innerHeight - ENGAGE_EPSILON &&
                rect.bottom <= window.innerHeight + ENGAGE_EPSILON * 4 &&
                activeIndexRef.current > 0;

            if (!enteringDown && !enteringUp) return;

            const correction = enteringDown
                ? rect.top - HEADER_OFFSET
                : rect.bottom - window.innerHeight;

            lockedRef.current = true;
            accumRef.current = 0;
            lenis.scrollTo(lenis.scroll + correction, { immediate: true });
            lenis.stop();
        };

        lenis.on("scroll", onScroll);
        return () => {
            lenis.off("scroll", onScroll);
        };
    }, [lenis]);

    // Once locked, raw wheel/touch input is read directly — Lenis itself is
    // stopped and ignores it — and converted into discrete card steps.
    useEffect(() => {
        function consume(deltaY: number) {
            if (!lockedRef.current) return false;
            accumRef.current += deltaY;
            if (Math.abs(accumRef.current) >= STEP_DISTANCE) {
                step(accumRef.current > 0 ? 1 : -1);
                accumRef.current = 0;
            }
            return true;
        }

        function onWheel(e: WheelEvent) {
            if (consume(e.deltaY)) e.preventDefault();
        }

        function onTouchStart(e: TouchEvent) {
            touchYRef.current = e.touches[0]?.clientY ?? null;
        }

        function onTouchMove(e: TouchEvent) {
            const startY = touchYRef.current;
            const currentY = e.touches[0]?.clientY;
            if (startY == null || currentY == null) return;
            touchYRef.current = currentY;
            if (consume(startY - currentY)) e.preventDefault();
        }

        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });

        return () => {
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
        };
    }, [step]);

    // Safety net: never leave the page permanently frozen if this component
    // unmounts mid-hold (route change, hot reload, etc.).
    useEffect(() => {
        return () => {
            if (lockedRef.current) {
                lockedRef.current = false;
                lenis?.start();
            }
        };
    }, [lenis]);

    const goTo = useCallback((index: number) => {
        const clamped = Math.min(TOTAL - 1, Math.max(0, index));
        setDirection(clamped >= activeIndexRef.current ? 1 : -1);
        activeIndexRef.current = clamped;
        setActiveIndex(clamped);
    }, []);

    // Smaller stage than Section 2's full-viewport ring — sized to comfortably
    // sit inside the existing card body rather than take over the screen.
    const radius = isMobile ? 190 : 340;
    const cardWidth = isMobile ? 120 : 190;
    const cardHeight = isMobile ? 170 : 270;
    const stageHeight = isMobile ? 240 : 360;

    return (
        <div
            ref={sectionRef}
            className="relative w-full h-[calc(100vh-60px)] max-w-6xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center"
        >
            <div
                className="relative w-full flex items-center justify-center"
                style={{ perspective: "1400px", height: stageHeight }}
            >
                {/* Rotating ring — same rotateY/translateZ 3D technique as Section 2,
            just scaled down to fit this section's existing footprint. */}
                <div
                    className="relative"
                    style={{
                        width: cardWidth,
                        height: cardHeight,
                        transformStyle: "preserve-3d",
                        transform: `rotateY(${-activeIndex * ANGLE_STEP}deg)`,
                        transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
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
    );
}