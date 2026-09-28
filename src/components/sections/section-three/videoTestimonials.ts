/**
 * Video testimonials shown inside Section Three's scenes.
 *
 * They are NOT a separate section: they are one more "scene" appended to the
 * same continuous scroll timeline as the text-testimonial categories, so the
 * cards keep flowing up over the same pinned background with no pause, no
 * gap and no divider (see SectionThree.tsx for how the timeline is sliced).
 *
 * To add / swap a video: edit VIDEO_TESTIMONIALS. To drop in a local
 * thumbnail, set `thumb` (e.g. "/images/anthony-trucks.jpg"); otherwise the
 * YouTube-generated thumbnail is used.
 */

import { mulberry32, SHUFFLE_SEED } from "./sceneLayout.ts";

export type VideoTestimonial = {
    id: string;        // YouTube video id
    title: string;     // person's name
    thumb?: string;    // optional local thumbnail override
};

export const VIDEO_TESTIMONIALS: VideoTestimonial[] = [
    { id: "AJf-fylSIdU", title: "Anthony Trucks" },
    { id: "mFiJnsZqwBs", title: "Reggie Williams" },
    { id: "-Io-4RYDyos", title: "Rob Palomo" },
    { id: "B14ikRKEcy0", title: "Logan Sullivan" },
    { id: "QKk5Pi01DxM", title: "Anish" },
    { id: "9d-MT_86M-w", title: "Gigi" },
];

export function getVideoThumb(video: VideoTestimonial) {
    // hqdefault is 4:3 with letterbox bars; `object-cover` inside a 16:9 box
    // crops exactly those bars away, and hqdefault exists for every video.
    return video.thumb ?? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
}

/** Videos that ride along inside each scene (next to its text cards). */
export const VIDEOS_PER_SCENE = 2;

/**
 * Picks VIDEOS_PER_SCENE videos for every scene in a seeded-random order.
 * With more scene slots than videos, the shuffled list wraps around - add
 * videos to VIDEO_TESTIMONIALS to avoid repeats.
 */
export function pickSceneVideos(sceneCount: number): VideoTestimonial[][] {
    const rand = mulberry32(SHUFFLE_SEED);
    const order = [...VIDEO_TESTIMONIALS];
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    return Array.from({ length: sceneCount }, (_, s) =>
        Array.from({ length: VIDEOS_PER_SCENE }, (_, k) => order[(s * VIDEOS_PER_SCENE + k) % order.length])
    );
}