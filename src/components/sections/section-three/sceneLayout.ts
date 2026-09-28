/**
 * Non-overlapping layout for the cards of one scene (text + video together).
 *
 * The stage has two vertical LANES (left / right). Cards in a lane are stacked
 * top-to-bottom with a fixed gap sized from the card's height, and the two
 * lanes never share horizontal space, so no two cards can ever overlap - not
 * at rest and not while scrolling. Each lane scrolls at its own speed (the
 * parallax), which is safe precisely because the lanes never overlap in x.
 *
 * Which card lands in which lane / row is seeded-random: it looks shuffled but
 * is identical on server and client (no hydration mismatch).
 */

/** Change this number to get a different (still stable) random arrangement. */
export const SHUFFLE_SEED = 20260929;

export function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export type ItemKind = "text" | "video";

export type Placement = {
    /** Horizontal centre, % of stage width. */
    left: number;
    /** Desktop vertical centre: px (at scale 1) from the middle of the visible stage. */
    yD: number;
    /** Small-screen vertical centre: px from the middle of the visible stage. */
    yM: number;
    /** Scroll speed multiplier (per lane). */
    speed: number;
};

/** Video card width in px at the desktop reference size (pre-scale). */
export const VIDEO_WIDTH = 230;

// Card heights (worst case) used to space cards inside a lane.
const H_D = { text: 340, video: 235 };
const H_M = { text: 260, video: 160 };
const GAP_D = 44;
const GAP_M = 32;

const LANE_X = [25, 75];
const LANE_SPEED = [1.0, 1.12];

function stack(items: number[], kinds: ItemKind[], h: { text: number; video: number }, gap: number) {
    const total = items.reduce((sum, i) => sum + h[kinds[i]], 0) + gap * (items.length - 1);
    const centres = new Map<number, number>();
    let cursor = -total / 2;
    for (const i of items) {
        centres.set(i, cursor + h[kinds[i]] / 2);
        cursor += h[kinds[i]] + gap;
    }
    return centres;
}

/** Returns one Placement per entry of `kinds` (same order). */
export function layoutScene(kinds: ItemKind[], sceneIndex: number): Placement[] {
    const rand = mulberry32(SHUFFLE_SEED + sceneIndex * 101);
    const n = kinds.length;
    const bigSize = Math.ceil(n / 2);
    // Alternate which side carries the bigger stack.
    const bigLane = sceneIndex % 2 === 0 ? 0 : 1;

    let order: number[] = [];
    for (let attempt = 0; attempt < 30; attempt++) {
        order = Array.from({ length: n }, (_, i) => i);
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        const big = order.slice(0, bigSize);
        const small = order.slice(bigSize);
        const ok = [big, small].every((lane) => lane.length === 0 || lane.some((i) => kinds[i] === "text"));
        if (ok) break;
    }

    const lanes: number[][] = [[], []];
    lanes[bigLane] = order.slice(0, bigSize);
    lanes[1 - bigLane] = order.slice(bigSize);

    const out: Placement[] = new Array(n);
    lanes.forEach((items, lane) => {
        const yD = stack(items, kinds, H_D, GAP_D);
        const yM = stack(items, kinds, H_M, GAP_M);
        for (const i of items) {
            out[i] = {
                left: LANE_X[lane] + (rand() - 0.5) * 2,
                yD: yD.get(i)!,
                yM: yM.get(i)!,
                speed: LANE_SPEED[lane],
            };
        }
    });
    return out;
}