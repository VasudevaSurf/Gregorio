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

function clamp01(v: number) {
    return Math.min(1, Math.max(0, v));
}

/**
 * Drives the ring off THIS section's own natural scroll distance only —
 * no dedicated tall wrapper, no ScrollTrigger pin, nothing added on top of
 * the `min-h-screen` card body page.tsx already wraps this component in.
 * `progress` runs 0 -> 1 as the section travels from just entering the
 * bottom of the viewport to just leaving the top — i.e. across whatever
 * height the section already has, never more (unlike Section 2, which
 * gets its own +1000vh of dedicated scroll runway to rotate through).
 */
function useLocalScrollProgress(ref: React.RefObject<HTMLElement | null>) {
    const { lenis } = useSmoothScroll();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            const el = ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const total = rect.height + vh;
            const traveled = vh - rect.top;
            setProgress(clamp01(total > 0 ? traveled / total : 0));
        };

        update();
        lenis?.on("scroll", update);
        window.addEventListener("resize", update);

        return () => {
            lenis?.off("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [ref, lenis]);

    return progress;
}

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
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const progress = useLocalScrollProgress(wrapperRef);

    // Scroll-driven rotation, tied 1:1 to progress exactly like Section 2's
    // ring — just measured across this section's own small footprint instead
    // of a separate giant scroll-jacked one.
    const rotationStep = progress * (TOTAL - 1);
    const scrollIndex = Math.min(TOTAL - 1, Math.round(rotationStep));

    // A click on a card or arrow briefly "takes over" from scroll position so
    // the buttons feel responsive; control hands back to scroll as soon as
    // scroll position itself reaches that same card. Handing back is derived
    // during render (not via a setState-in-effect) to avoid a cascading
    // extra render on every scroll tick.
    const [manualTarget, setManualTarget] = useState<number | null>(null);
    const manualIndex =
        manualTarget !== null && Math.round(rotationStep) !== manualTarget
            ? manualTarget
            : null;

    const displayRotation = manualIndex ?? rotationStep;
    const displayIndex = manualIndex ?? scrollIndex;

    const prevIndexRef = useRef(0);
    const [direction, setDirection] = useState(1);
    useEffect(() => {
        setDirection(displayIndex >= prevIndexRef.current ? 1 : -1);
        prevIndexRef.current = displayIndex;
    }, [displayIndex]);

    const goTo = useCallback((index: number) => {
        setManualTarget(Math.min(TOTAL - 1, Math.max(0, index)));
    }, []);

    // Smaller stage than Section 2's full-viewport ring — sized to comfortably
    // sit inside the existing card body rather than take over the screen.
    const radius = isMobile ? 190 : 340;
    const cardWidth = isMobile ? 120 : 190;
    const cardHeight = isMobile ? 170 : 270;
    const stageHeight = isMobile ? 240 : 360;

    return (
        <div
            ref={wrapperRef}
            className="max-w-6xl mx-auto px-6 md:px-12 py-6 sm:py-10 flex flex-col items-center justify-center min-h-[calc(100vh-60px)]"
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
                        transform: `rotateY(${-displayRotation * ANGLE_STEP}deg)`,
                        transition:
                            manualIndex !== null
                                ? "transform 0.6s cubic-bezier(0.22,1,0.36,1)"
                                : undefined,
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
                            key={items[displayIndex].id}
                            custom={direction}
                            initial={{ y: direction > 0 ? 20 : -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: direction > 0 ? -20 : 20, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
                            className="font-sans text-base sm:text-lg font-bold uppercase tracking-tight text-white text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                        >
                            {items[displayIndex].title}
                        </motion.h4>
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
                <button
                    aria-label="Previous"
                    onClick={() => goTo(displayIndex - 1)}
                    disabled={displayIndex === 0}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-lime-400 hover:bg-lime-300 disabled:opacity-30 disabled:hover:bg-lime-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-black" />
                </button>
                <button
                    aria-label="Next"
                    onClick={() => goTo(displayIndex + 1)}
                    disabled={displayIndex === TOTAL - 1}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-lime-400 hover:bg-lime-300 disabled:opacity-30 disabled:hover:bg-lime-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                    <ArrowRight className="w-5 h-5 text-black" />
                </button>
            </div>
        </div>
    );
}