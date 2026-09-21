/**
 * Video testimonials shown as the final beat of Section Three.
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

export type VideoSlot = {
    /** Desktop (>=1024px) resting position. `top` is a 0..1 fraction of the
     *  VISIBLE stage (below the stacked sticky headers), `left` is % of width. */
    desktop: { top: number; left: number };
    /** Small-screen (<1024px) resting position, same units as above. */
    mobile: { top: number; left: number };
    /** Card width in px at the desktop reference size (pre-scale). */
    width: number;
    rotate: number;
    /**
     * Scroll speed multiplier. Values increase with index so that, in BOTH
     * the desktop grid and the 2-lane mobile grid, a card lower on screen
     * always travels a little faster than the one above it in its column —
     * the gap between vertically-stacked cards only ever grows while they
     * scroll in, so they can never run into each other.
     */
    speed: number;
};

/**
 * 6 resting slots — 3 cols x 2 rows on desktop, 2 lanes x 3 rows on small
 * screens. Every card finishes its journey exactly at the end of the
 * section's pin, so the videos are fully on screen (and clickable) right
 * before the section releases.
 */
export const VIDEO_SLOTS: VideoSlot[] = [
    { desktop: { top: 0.28, left: 21 }, mobile: { top: 0.17, left: 26 }, width: 230, rotate: -2, speed: 0.9 },
    { desktop: { top: 0.24, left: 50 }, mobile: { top: 0.22, left: 74 }, width: 230, rotate: 1.2, speed: 0.95 },
    { desktop: { top: 0.28, left: 79 }, mobile: { top: 0.5, left: 26 }, width: 230, rotate: 2, speed: 1.0 },
    { desktop: { top: 0.76, left: 21 }, mobile: { top: 0.55, left: 74 }, width: 230, rotate: 1.5, speed: 1.05 },
    { desktop: { top: 0.72, left: 50 }, mobile: { top: 0.83, left: 26 }, width: 230, rotate: -1.5, speed: 1.1 },
    { desktop: { top: 0.76, left: 79 }, mobile: { top: 0.88, left: 74 }, width: 230, rotate: -1, speed: 1.15 },
];