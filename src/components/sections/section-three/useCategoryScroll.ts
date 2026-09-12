"use client";

import { useEffect, useState } from "react";
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
    const { lenis } = useSmoothScroll();
    const [raw, setRaw] = useState(0);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        const st = ScrollTrigger.create({
            trigger: el,
            // "top top" = the exact scroll position where the sticky panel
            // engages. "bottom bottom" = the exact scroll position where it
            // disengages. Together they span precisely the pin duration.
            start: "top top",
            end: "bottom bottom",
            // Tied 1:1 to scroll position via Lenis — see note elsewhere in
            // this project on why a numeric scrub value fights Lenis's own
            // smoothing.
            scrub: true,
            onUpdate: (self) => setRaw(self.progress),
        });

        const onLenisScroll = () => ScrollTrigger.update();
        lenis?.on("scroll", onLenisScroll);

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);

        ScrollTrigger.refresh();

        return () => {
            lenis?.off("scroll", onLenisScroll);
            window.removeEventListener("resize", onResize);
            st.kill();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lenis, wrapperRef]);

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
    card: { from: { x: number; y: number }; rotate: number; scale: number; speed: number; driftAmplitude: number; driftPhase: number }
): CardTransform {
    const t = clamp01(raw);

    const yTravel = card.from.y * CARD_TRAVEL_SCALE;
    const xTravel = card.from.x * CARD_TRAVEL_SCALE * 0.4;
    // Linear across the full pin window, scaled per-card by `speed` so
    // cards don't all move in lockstep — some drift faster/slower.
    const y = (0.5 - t) * 2 * yTravel * card.speed;
    const x = (0.5 - t) * 2 * xTravel;

    // Small continuous sinusoidal life so the motion doesn't feel robotic.
    const wiggle = Math.sin(t * Math.PI * 2 * card.speed + card.driftPhase) * card.driftAmplitude * 0.3;

    const rotate = card.rotate + (0.5 - t) * 2 * (card.from.x >= 0 ? 6 : -6);
    const scale = card.scale;

    return { x, y: y + wiggle, rotate, scale, opacity: 1 };
}