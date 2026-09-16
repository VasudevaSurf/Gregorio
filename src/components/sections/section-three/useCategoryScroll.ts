"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export function clamp01(v: number) {
    return Math.min(1, Math.max(0, v));
}

/**
 * Extra scroll runway (in vh) given to each category ON TOP OF the 100vh it
 * needs to be pinned/visible. This is the distance the cards get to travel
 * across the fixed background before the next category takes over. Bigger
 * = cards travel further / the section feels longer; smaller = snappier.
 * Total scroll length per category = 100vh + CARD_SCROLL_VH.
 */
export const CARD_SCROLL_VH = 80;

/**
 * Tracks ONE category's own progress through its pinned window.
 *
 * Each category is: a tall wrapper (100vh + CARD_SCROLL_VH) containing a
 * `sticky top-0 h-screen` inner panel. The panel — background color + big
 * word — is pinned in place for exactly CARD_SCROLL_VH of scrolling (that's
 * how long a `sticky` child stays fixed inside a wrapper taller than it).
 * `raw` runs 0 -> 1 across that pinned duration, so cards can be driven
 * continuously by scroll while the backdrop itself never moves.
 */
export function useSceneScroll(wrapperRef: React.RefObject<HTMLElement | null>) {
    const [raw, setRaw] = useState(0);
    const lastRawRef = useRef(0);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        const st = ScrollTrigger.create({
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                const p = self.progress;
                if (Math.abs(p - lastRawRef.current) > 0.002) {
                    lastRawRef.current = p;
                    if (!rafIdRef.current) {
                        rafIdRef.current = requestAnimationFrame(() => {
                            setRaw((prev) => (Math.abs(prev - lastRawRef.current) > 0.002 ? lastRawRef.current : prev));
                            rafIdRef.current = null;
                        });
                    }
                }
            },
        });

        // Set initial progress once on mount if scrolled
        if (typeof st.progress === "number" && st.progress > 0.005) {
            lastRawRef.current = st.progress;
            setRaw(st.progress);
        }

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);

        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            window.removeEventListener("resize", onResize);
            st.kill();
        };
    }, [wrapperRef]);

    return raw;
}

/** Cards' configured `from` vectors get scaled by this to set how far they
 *  travel across the pinned panel. Tune this, not the per-card `from`
 *  values in categoryScenes.ts, to adjust "how far cards scroll" globally. */
const CARD_TRAVEL_SCALE = 1.4;

export interface CardTransform {
    x: number;
    y: number;
    rotate: number;
    scale: number;
    opacity: number;
}

/**
 * Derives a card's transform purely from `raw` (0..1, continuous across the
 * whole pin duration — no enter/hold/exit phases). The card moves the whole
 * time you scroll, exactly like normal content scrolling over a fixed
 * backdrop; it's clipped by the panel's `overflow-hidden` as it passes the
 * top/bottom edges, so no opacity fade is needed to hide it.
 */
export function getCardTransform(
    raw: number,
    card: { from: { x: number; y: number }; rotate: number; scale: number; speed: number; driftAmplitude: number; driftPhase: number },
    sceneIndex: number = 0,
    totalScenes: number = 5,
    isSmallScreen: boolean = false
): CardTransform {
    const sceneCenter = (sceneIndex + 0.5) / totalScenes;
    let diff = raw - sceneCenter;

    // For scene 0 at raw=0, clamp initial offset so cards start comfortably visible
    if (sceneIndex === 0 && diff < -0.08) {
        diff = -0.08 + (diff + 0.08) * 0.35;
    }

    // On small screens, cards maintain uniform speed so they never collide or drift into each other
    const effectiveSpeed = isSmallScreen ? 1.0 : (card.speed ?? 1);
    const yTravelPx = 5200 * effectiveSpeed;
    const y = -diff * yTravelPx;

    const wiggle = isSmallScreen
        ? 0
        : Math.sin(raw * Math.PI * 8 + card.driftPhase) * card.driftAmplitude * 0.35;

    const maxDistance = 1400;
    const fadeDistance = 350;
    const absY = Math.abs(y);
    const opacity = absY >= maxDistance ? 0 : clamp01((maxDistance - absY) / fadeDistance);

    return {
        x: 0,
        y: y + wiggle,
        rotate: card.rotate,
        scale: card.scale,
        opacity,
    };
}