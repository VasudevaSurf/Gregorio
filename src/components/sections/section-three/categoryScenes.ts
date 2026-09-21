/**
 * Section Three "testimonial showcase" layout.
 *
 * The CONTENT lives in testimonials.ts (one entry = one card, nothing is
 * repeated). This file only decides where those cards sit and how they move:
 * testimonials are chunked into scenes of CARDS_PER_SCENE, and each card in
 * a scene takes the next slot from CARD_SLOTS (odd scenes are mirrored so the
 * layout doesn't look stamped).
 *
 * Coordinate system for `top`/`left`:
 *  - percentages of the stage (0-100) measured from the top-left corner,
 *    referring to the CENTER of the card.
 *  - width is px at the desktop reference size (scaled in SectionThree).
 *  - layer: "front" cards render above "back" cards.
 *  - from: only `from.x` is used (a small horizontal offset).
 *  - speed: relative scroll speed so cards never move in lockstep.
 *  - rotate/scale: resting rotation (deg) and scale.
 */

import { TESTIMONIALS } from "./testimonials";
import type { Testimonial } from "./testimonials";

export type CardConfig = {
    id: string;
    headline: string;   // bold lead-in sentence of the quote
    body: string;       // italic remainder of the quote
    name: string;
    subtitle: string;
    avatarInitials: string;
    avatarSrc?: string; // photo; falls back to initials if it fails to load
    width: number;
    top: number;
    left: number;
    layer: "front" | "back";
    rotate: number;
    scale: number;
    from: { x: number; y: number };
    speed: number;
    driftAmplitude: number;
    driftPhase: number;
};

export type MobileCardConfig = CardConfig;

export type CategoryScene = {
    id: string;
    label: string;
    word: string;
    background: string;
    textColor: string;
    accent: string;
    cards: CardConfig[];
};

/** How many testimonial cards each scene holds (max 3 slots below). */
const CARDS_PER_SCENE = 3;

type Slot = Omit<CardConfig, "id" | "headline" | "body" | "name" | "subtitle" | "avatarInitials" | "avatarSrc">;

const CARD_SLOTS: Slot[] = [
    { width: 340, top: 20, left: 78, layer: "front", rotate: -2, scale: 1, from: { x: 220, y: -140 }, speed: 0.85, driftAmplitude: 14, driftPhase: 0.2 },
    { width: 330, top: 70, left: 20, layer: "back", rotate: 2, scale: 1, from: { x: -200, y: 160 }, speed: 1.1, driftAmplitude: 12, driftPhase: 1.6 },
    { width: 320, top: 78, left: 62, layer: "front", rotate: 3, scale: 0.95, from: { x: 180, y: 160 }, speed: 1.0, driftAmplitude: 12, driftPhase: 2.8 },
];

/** Every scene shares one palette, so the pinned background never changes. */
const THEME = { background: "#6b685e", textColor: "#d9d5c9", accent: "#f2ede0" };

function initials(name: string) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function slug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** The card template adds its own opening/closing quote marks, so drop the
 *  curly ones that come with the source text. */
function stripOpeningQuote(s: string) {
    return s.replace(/^[‘'"“]\s*/, "");
}
function stripClosingQuote(s: string) {
    return s.replace(/\s*[’'"”]$/, "");
}

function buildCard(t: Testimonial, slot: Slot, mirrored: boolean): CardConfig {
    return {
        ...slot,
        left: mirrored ? 100 - slot.left : slot.left,
        rotate: mirrored ? -slot.rotate : slot.rotate,
        from: { x: mirrored ? -slot.from.x : slot.from.x, y: slot.from.y },
        id: `t-${slug(t.name)}`,
        headline: stripOpeningQuote(t.highlight),
        body: stripClosingQuote(t.quote),
        name: t.name,
        subtitle: t.role,
        avatarInitials: initials(t.name),
        avatarSrc: t.image ? `/${t.image.replace(/^\/+/, "")}` : undefined,
    };
}

export const CATEGORY_SCENES: CategoryScene[] = Array.from(
    { length: Math.ceil(TESTIMONIALS.length / CARDS_PER_SCENE) },
    (_, sceneIndex) => {
        const mirrored = sceneIndex % 2 === 1;
        const chunk = TESTIMONIALS.slice(sceneIndex * CARDS_PER_SCENE, (sceneIndex + 1) * CARDS_PER_SCENE);
        const label = String(sceneIndex + 1).padStart(2, "0");
        return {
            id: label,
            label,
            word: label,
            ...THEME,
            cards: chunk.map((t, i) => buildCard(t, CARD_SLOTS[i], mirrored)),
        };
    }
);

/** How many vh each category gets within the section's single scroll timeline. */
export const SCROLL_VH_PER_CATEGORY = 100;