/**
 * Section Three "testimonial showcase" layout.
 *
 * The CONTENT lives in testimonials.ts (one entry = one card) and
 * videoTestimonials.ts. This file groups testimonials into scenes of
 * CARDS_PER_SCENE, adds VIDEOS_PER_SCENE video cards to each scene, and asks
 * sceneLayout.ts for non-overlapping positions for all of them.
 */

import { TESTIMONIALS } from "./testimonials";
import type { Testimonial } from "./testimonials";
import { pickSceneVideos, VIDEOS_PER_SCENE } from "./videoTestimonials";
import type { VideoTestimonial } from "./videoTestimonials";
import { layoutScene } from "./sceneLayout.ts";
import type { ItemKind, Placement } from "./sceneLayout.ts";

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
    place: Placement;
};

export type MobileCardConfig = CardConfig;

export type SceneVideo = { video: VideoTestimonial; place: Placement };

export type CategoryScene = {
    id: string;
    label: string;
    word: string;
    background: string;
    textColor: string;
    accent: string;
    cards: CardConfig[];
    videos: SceneVideo[];
};

/** How many testimonial cards each scene holds. */
const CARDS_PER_SCENE = 3;

/** Per-scene palettes. SectionThree blends the pinned background from one
 *  scene's colour to the next as you scroll. Scenes cycle through this list. */
const PALETTES = [
    { background: "#2b2a26", textColor: "#e8e5da", accent: "#8a7f68" }, // warm near-black
    { background: "#6f7b6c", textColor: "#e6e1cf", accent: "#4f5b4d" }, // sage green
    { background: "#d9d2bd", textColor: "#2a2925", accent: "#7a6a4a" }, // light sand
    { background: "#3d4a52", textColor: "#d5dee2", accent: "#5b7079" }, // slate blue
];

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

function buildCard(t: Testimonial, index: number, place: Placement): CardConfig {
    return {
        width: 340,
        top: 0,
        left: place.left,
        layer: "front",
        rotate: 0,
        scale: 1,
        from: { x: 0, y: 0 },
        speed: place.speed,
        driftAmplitude: 6,
        driftPhase: index * 1.7,
        place,
        id: `t-${slug(t.name)}`,
        headline: stripOpeningQuote(t.highlight),
        body: stripClosingQuote(t.quote),
        name: t.name,
        subtitle: t.role,
        avatarInitials: initials(t.name),
        avatarSrc: t.image ? `/${t.image.replace(/^\/+/, "")}` : undefined,
    };
}

const SCENE_COUNT = Math.ceil(TESTIMONIALS.length / CARDS_PER_SCENE);
const SCENE_VIDEOS = pickSceneVideos(SCENE_COUNT);

export const CATEGORY_SCENES: CategoryScene[] = Array.from({ length: SCENE_COUNT }, (_, sceneIndex) => {
    const chunk = TESTIMONIALS.slice(sceneIndex * CARDS_PER_SCENE, (sceneIndex + 1) * CARDS_PER_SCENE);
    const videos = SCENE_VIDEOS[sceneIndex].slice(0, VIDEOS_PER_SCENE);
    const kinds: ItemKind[] = [...chunk.map((): ItemKind => "text"), ...videos.map((): ItemKind => "video")];
    const places = layoutScene(kinds, sceneIndex);
    const label = String(sceneIndex + 1).padStart(2, "0");
    return {
        id: label,
        label,
        word: label,
        ...PALETTES[sceneIndex % PALETTES.length],
        cards: chunk.map((t, i) => buildCard(t, i, places[i])),
        videos: videos.map((video, i) => ({ video, place: places[chunk.length + i] })),
    };
});

/** How many vh each category gets within the section's single scroll timeline. */
export const SCROLL_VH_PER_CATEGORY = 100;