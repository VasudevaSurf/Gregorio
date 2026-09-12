"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { CATEGORY_SCENES, SCROLL_VH_PER_CATEGORY } from "./categoryScenes";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const CATEGORY_COUNT = CATEGORY_SCENES.length;

/** Data attribute placed (in page.tsx) on the tall wrapper that gives
 *  Section Three its own dedicated scroll runway, independent of whatever
 *  sections happen to sit after it. */
const TRACK_SELECTOR = "[data-s3-track]";

/**
 * Smoothstep easing used to fade/scale cards in and out at the edges of
 * their category's active window, instead of a linear cut.
 */
function smoothstep(edge0: number, edge1: number, x: number) {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

export function clamp01(v: number) {
    return Math.min(1, Math.max(0, v));
}

export interface CategoryProgress {
    /** 0..1 progress across the whole pinned scene. */
    sceneProgress: number;
    /** Fractional category position, e.g. 1.35 = 35% into category index 1. */
    segment: number;
    /** Nearest category index, for nav highlighting. */
    activeIndex: number;
}

/**
 * Sets up a ScrollTrigger over the section's dedicated tall tracking wrapper
 * and reports scroll progress. Progress is a pure function of scroll
 * position (not scroll direction/velocity), so the animation is identical
 * scrolling down or back up.
 */
export function useCategoryScroll(containerRef: React.RefObject<HTMLElement | null>) {
    const { lenis } = useSmoothScroll();
    const [progress, setProgress] = useState<CategoryProgress>({
        sceneProgress: 0,
        segment: 0,
        activeIndex: 0,
    });
    const triggerRef = useRef<ScrollTrigger | null>(null);
    const trackElRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const trackEl = container.closest<HTMLElement>(TRACK_SELECTOR);
        if (!trackEl) return;
        trackElRef.current = trackEl;

        // Give the track wrapper its scroll runway: one viewport height of scroll
        // per category. Set here (rather than hardcoded in page.tsx) so this
        // file and categoryScenes.ts stay the single source of truth.
        trackEl.style.height = `${CATEGORY_COUNT * SCROLL_VH_PER_CATEGORY}vh`;

        // The sticky panel (container's direct parent, per page.tsx) pins at a
        // non-zero top offset (the stacked header bars above it: 48/64/80px
        // depending on breakpoint). Read that offset so progress 0..1 lines up
        // exactly with when the panel is actually pinned on screen, rather than
        // assuming it pins flush at the very top of the viewport.
        const stickyEl = container.parentElement;
        const offset = stickyEl
            ? parseFloat(getComputedStyle(stickyEl).top) || 0
            : 0;

        const st = ScrollTrigger.create({
            trigger: trackEl,
            start: `top top+=${offset}`,
            end: `bottom top+=${offset}`,
            // Tied 1:1 to scroll position (via Lenis, which already does the
            // smoothing). A numeric scrub here would add a *second*,
            // independent layer of easing on top of Lenis's — the two fight
            // each other and the animation keeps drifting/catching up for a
            // moment after you stop scrolling, which reads as the page
            // "transporting" on its own instead of tracking your scroll.
            // The gradual, non-abrupt feel comes from the wide crossfade
            // window in ANIM below, not from adding lag here.
            scrub: true,
            onUpdate: (self) => {
                const sceneProgress = self.progress;
                const segment = sceneProgress * CATEGORY_COUNT;
                const activeIndex = Math.min(
                    CATEGORY_COUNT - 1,
                    Math.floor(segment + 0.0001)
                );
                setProgress({ sceneProgress, segment, activeIndex });
            },
        });
        triggerRef.current = st;

        // Keep ScrollTrigger in sync with the app's Lenis smooth-scroll instance
        // instead of native scroll events (Lenis drives the actual scroll).
        const onLenisScroll = () => ScrollTrigger.update();
        lenis?.on("scroll", onLenisScroll);

        // Recompute on resize (fonts/layout settling, orientation change, etc).
        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);

        // Run once so cards have correct positions before any scroll happens.
        ScrollTrigger.refresh();

        return () => {
            lenis?.off("scroll", onLenisScroll);
            window.removeEventListener("resize", onResize);
            st.kill();
            triggerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lenis]);

    /** Scroll to a given category index (used by the pill nav). */
    const jumpToCategory = useCallback((index: number) => {
        const trackEl = trackElRef.current;
        if (!trackEl || !lenis) return;
        const rect = trackEl.getBoundingClientRect();
        const trackTop = rect.top + window.scrollY;
        const trackHeight = trackEl.offsetHeight;
        const targetY =
            trackTop + (trackHeight * (index + 0.5)) / CATEGORY_COUNT;
        lenis.scrollTo(targetY, { duration: 1.1 });
    }, [lenis]);

    return { ...progress, jumpToCategory };
}

/** Per-category timing envelope, expressed as fractions of that category's
 *  own local window (0..1). Keeping these named/shared avoids "magic
 *  numbers" scattered through the render code. */
export const ANIM = {
    // How far (as a fraction of a category's own 100vh window) the crossfade
    // reaches into the neighboring category on each side. This used to be
    // 0.18 (an 18% overlap), which — combined with the 1:1 scrub — read as
    // an abrupt cut rather than a dissolve. Widening it to 0.34 spreads the
    // fade across roughly a third of each neighboring category's scroll
    // distance, which is what gives the gradual, one-scene-melts-into-the-
    // next feel.
    enterStart: -0.34,
    enterEnd: 0,
    exitStart: 1,
    exitEnd: 1.34,
    driftStart: 0.12,
    driftEnd: 0.88,
};

/** Cards no longer travel their full configured `from` distance — it reads
 *  as them flying in from way off-frame. Scaling it down keeps the same
 *  directional entrance/exit feel while keeping the motion (and the card's
 *  resting position) closer to where it settles. Tune this, not the per-card
 *  `from` values in categoryScenes.ts, to adjust "how far cards travel"
 *  globally. */
const CARD_TRAVEL_SCALE = 0.5;

/**
 * A category's own fade/scale envelope — 0 outside its window, ramping to 1
 * across the shared entry/exit smoothstep, 1 through the hold. Shared here
 * so the component doesn't hand-duplicate these constants.
 */
export function getCategoryVisibility(raw: number) {
    const enter = smoothstep(ANIM.enterStart, ANIM.enterEnd, raw);
    const exit = 1 - smoothstep(ANIM.exitStart, ANIM.exitEnd, raw);
    return Math.min(enter, exit);
}

export interface CardTransform {
    x: number;
    y: number;
    rotate: number;
    scale: number;
    opacity: number;
}

/**
 * Derives a card's transform purely from the category's local progress
 * (`raw`, which can be negative before the category starts and >1 after it
 * ends). Entry and exit reuse the same `from` vector (a card that flies in
 * from the right also exits to the right) which keeps motion legible while
 * still letting each card have its own direction/speed/rotation.
 */
export function getCardTransform(
    raw: number,
    card: { from: { x: number; y: number }; rotate: number; scale: number; speed: number; driftAmplitude: number; driftPhase: number }
): CardTransform {
    const enter = smoothstep(ANIM.enterStart, ANIM.enterEnd, raw);
    const exit = 1 - smoothstep(ANIM.exitStart, ANIM.exitEnd, raw);
    const visibility = Math.min(enter, exit);

    const settleT = clamp01(raw);

    // Continuous, deterministic drift during the "hold" phase — a gentle sine
    // path unique per card (amplitude/phase from config) so cards feel alive
    // and independent without ever being random or autoplaying on their own.
    const driftT = clamp01(
        (settleT - ANIM.driftStart) / (ANIM.driftEnd - ANIM.driftStart)
    );
    const drift = Math.sin(driftT * Math.PI * 2 * card.speed + card.driftPhase) * card.driftAmplitude * driftT * (1 - driftT) * 4;

    // Position: fully offset (from vector) outside the visible window,
    // settled (0,0) inside it — eased by `visibility` so it glides rather
    // than snapping, and each card's own speed skews how quickly it commits.
    const travel = 1 - visibility;
    const eased = travel * travel * (3 - 2 * travel);
    const fromX = card.from.x * CARD_TRAVEL_SCALE;
    const fromY = card.from.y * CARD_TRAVEL_SCALE;
    const x = fromX * eased * card.speed * 0.6 + fromX * eased * 0.4;
    const y = fromY * eased + drift;

    const rotate = card.rotate + (1 - visibility) * (card.from.x >= 0 ? 10 : -10) * 0.4;
    const scale = card.scale * (0.86 + 0.14 * visibility);

    return { x, y, rotate, scale, opacity: visibility };
}