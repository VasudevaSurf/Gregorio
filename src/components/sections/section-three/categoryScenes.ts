/**
 * Configuration for the Section Three "testimonial showcase" animation.
 *
 * Nothing here is hardcoded into the component — edit this file to change
 * quotes, names, sizes, positions, rotation, scale, layering or scroll
 * pacing. All 5 categories share ONE continuous pinned background; each
 * category just owns a slice of the scroll timeline and shows 5 cards.
 *
 * Coordinate system for `top`/`left` (and the implicit entry/exit derived
 * from `from`):
 *  - top / left are percentages of the stage (0-100), measured from the
 *    stage's top-left corner, and refer to the CENTER of the card.
 *  - width is in pixels at the desktop reference size (the stage scales
 *    down proportionally on smaller viewports via CSS clamp/vw).
 *  - layer: "front" cards render above the big word, "back" cards render
 *    below it.
 *  - from: cards now always travel straight up from below (see
 *    getCardTransform in useCategoryScroll.ts) — only the magnitude of
 *    `from.y` sets travel distance; `from.x` is unused.
 *  - speed: relative scrub speed multiplier so cards never move in lockstep.
 *  - rotate/scale: settle-state rotation (deg) and scale.
 *
 * NOTE: each scene currently repeats its 2 real testimonials into 5 card
 * slots (duplicate content, different position/motion) as a placeholder —
 * swap in unique quotes per slot whenever more content is ready.
 *
 * AUTO-PLACED 5th CARD: every scene's 4 hand-positioned cards can leave the
 * gap in a different spot (their widths/positions aren't identical scene to
 * scene), so the 5th card's `top`/`left` is NOT hand-typed like the others.
 * Each scene instead defines an `extraCard` / `extraMobileCard` with no
 * top/left — see `findOpenSpot` below, which scans the stage for wherever
 * that scene's other 4 cards actually leave room and places the 5th card
 * there automatically. Edit the 4 primary cards freely; the 5th will keep
 * re-finding an open spot rather than silently overlapping them.
 */

export type CardConfig = {
    id: string;
    headline: string;   // bold lead-in sentence of the quote
    body: string;        // italic remainder of the quote
    name: string;
    subtitle: string;
    avatarInitials: string;
    // avatarSrc?: string;   // <- add this + swap the initials-circle for
    //                          <OptimizedImage> in SectionThree.tsx once
    //                          real avatar photos are available
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
    mobileCards: MobileCardConfig[];
};

/**
 * Everything needed to build one scene, before the 5th "extra" card has
 * been given a position. `extraCard` / `extraMobileCard` carry every field
 * a normal card needs EXCEPT `top`/`left` — those get filled in by
 * `findOpenSpot` in `buildScene` below.
 */
type ExtraCardContent = Omit<CardConfig, "top" | "left">;

type CategorySceneDraft = {
    id: string;
    label: string;
    word: string;
    background: string;
    textColor: string;
    accent: string;
    cards: CardConfig[];
    mobileCards: MobileCardConfig[];
    extraCard: ExtraCardContent;
    extraMobileCard: ExtraCardContent;
};

// Same reference width the component uses to turn each card's pixel
// `width` into a percentage of the stage — kept in sync so the
// auto-placement math reasons about the same proportions as what actually
// renders.
const DESKTOP_REFERENCE_WIDTH = 1440;

// Assumed reference stage height (px) for turning an estimated card height
// back into a percentage of the stage — the stage is a `100vh` panel, so
// this is a rough 16:9-ish desktop viewport, just enough for the placement
// heuristic to reason in the same units on both axes.
const STAGE_REFERENCE_HEIGHT = 810;

// Same CARD_SPREAD constant SectionThree.tsx uses to pull every card's
// configured top/left in toward the center before rendering (see
// `pulledIn` there). The placement search has to compress candidate/
// existing positions the same way, or it ends up reasoning about where
// cards are configured to be rather than where they actually end up.
const CARD_SPREAD = 0.78;

function pulledIn(pct: number) {
    return 50 + (pct - 50) * CARD_SPREAD;
}

// Rough content-box metrics (in reference px, matching the desktop card
// styling in SectionThree.tsx) used only to estimate how TALL a card's
// text will make it — a 2-line quote and a 5-line quote at the same width
// render very differently, and treating every card as a fixed aspect
// ratio (the old approach) let a short new card silently collide with a
// long-quote neighbour it "should" have cleared.
const CARD_NON_TEXT_WIDTH = 130; // avatar + gaps + horizontal padding
const CARD_CHARS_PER_LINE_PX = 7.5; // avg glyph width at this font size
const CARD_LINE_HEIGHT_PX = 22;
const CARD_MAX_LINES = 5; // matches the WebkitLineClamp in SectionThree.tsx
const CARD_FIXED_OVERHEAD_PX = 110; // avatar row + name/subtitle + padding

function estimateCardHeightPx(widthPx: number, headline: string, body: string) {
    const usableTextWidth = Math.max(40, widthPx - CARD_NON_TEXT_WIDTH);
    const charsPerLine = usableTextWidth / CARD_CHARS_PER_LINE_PX;
    const totalChars = headline.length + body.length;
    const lines = Math.min(CARD_MAX_LINES, Math.max(1, Math.ceil(totalChars / charsPerLine)));
    return CARD_FIXED_OVERHEAD_PX + lines * CARD_LINE_HEIGHT_PX;
}

// Extra breathing room enforced around every card while searching for a
// spot, in stage percentage points. Bigger = the 5th card keeps a wider
// berth from its neighbours.
const PLACEMENT_MARGIN = 3;

type Box = { left: number; right: number; top: number; bottom: number };

function widthPercent(px: number) {
    return (px / DESKTOP_REFERENCE_WIDTH) * 100;
}

function heightPercent(px: number) {
    return (px / STAGE_REFERENCE_HEIGHT) * 100;
}

/** Builds a card's estimated bounding box in the same *rendered* (post
 *  pulledIn) coordinate space SectionThree.tsx actually draws in, using
 *  the card's configured center, its width, and a text-length-aware
 *  height estimate rather than a fixed aspect ratio. */
function cardBox(
    centerLeft: number,
    centerTop: number,
    widthPx: number,
    heightPx: number
): Box {
    const halfWidth = widthPercent(widthPx) / 2 + PLACEMENT_MARGIN;
    const halfHeight = heightPercent(heightPx) / 2 + PLACEMENT_MARGIN;
    const left = pulledIn(centerLeft);
    const top = pulledIn(centerTop);
    return {
        left: left - halfWidth,
        right: left + halfWidth,
        top: top - halfHeight,
        bottom: top + halfHeight,
    };
}

function overlapArea(a: Box, b: Box) {
    const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return w * h;
}

/**
 * Finds an open spot on the stage for a new card, given the cards already
 * placed in that scene. It scans a grid of candidate centers — starting
 * with the top-right corner (the gap this layout usually leaves), then the
 * other corners, then the whole stage as a last resort — and returns the
 * FIRST candidate that doesn't overlap any existing card (with a margin of
 * breathing room). If a scene is packed tightly enough that every
 * candidate overlaps something, it falls back to whichever candidate
 * overlaps the least, so a card is never blindly stacked on top of another.
 *
 * Both the existing cards and the candidate are boxed using their
 * text-aware estimated height AND the same `pulledIn` compression the
 * component applies at render time, so this reasons about actual on-screen
 * space rather than the raw config numbers.
 */
function findOpenSpot(
    existing: { top: number; left: number; width: number; headline: string; body: string }[],
    newCard: { width: number; headline: string; body: string }
): { top: number; left: number } {
    const existingBoxes = existing.map((c) =>
        cardBox(c.left, c.top, c.width, estimateCardHeightPx(c.width, c.headline, c.body))
    );
    const newCardHeight = estimateCardHeightPx(newCard.width, newCard.headline, newCard.body);

    const candidates: { top: number; left: number }[] = [];
    const add = (top: number, left: number) => candidates.push({ top, left });

    // 1) Preferred: hug the top-right corner, at a few depths/insets.
    [4, 6, 8, 10, 12, 15, 18, 22].forEach((top) => [94, 90, 86, 82].forEach((left) => add(top, left)));
    // 2) Other three corners as secondary preference.
    [4, 6, 8, 10, 12, 15, 18, 22].forEach((top) => [6, 10, 14, 18].forEach((left) => add(top, left)));
    [78, 82, 86, 90, 94].forEach((top) => [6, 10, 14, 18, 82, 86, 90, 94].forEach((left) => add(top, left)));
    // 3) General fallback grid across the whole stage.
    for (let top = 10; top <= 90; top += 6) {
        for (let left = 10; left <= 90; left += 6) {
            add(top, left);
        }
    }

    let best = candidates[0];
    let bestOverlap = Infinity;

    for (const candidate of candidates) {
        const box = cardBox(candidate.left, candidate.top, newCard.width, newCardHeight);
        const totalOverlap = existingBoxes.reduce((sum, b) => sum + overlapArea(box, b), 0);

        if (totalOverlap === 0) return candidate; // first clean spot wins, in preference order
        if (totalOverlap < bestOverlap) {
            bestOverlap = totalOverlap;
            best = candidate;
        }
    }

    return best;
}

function buildScene(draft: CategorySceneDraft): CategoryScene {
    const extraSpot = findOpenSpot(draft.cards, draft.extraCard);
    const extraMobileSpot = findOpenSpot(draft.mobileCards, draft.extraMobileCard);

    return {
        id: draft.id,
        label: draft.label,
        word: draft.word,
        background: draft.background,
        textColor: draft.textColor,
        accent: draft.accent,
        cards: [...draft.cards, { ...draft.extraCard, ...extraSpot }],
        mobileCards: [...draft.mobileCards, { ...draft.extraMobileCard, ...extraMobileSpot }],
    };
}

const SCENE_DRAFTS: CategorySceneDraft[] = [
    {
        id: "01",
        label: "01",
        word: "01",
        background: "#6b685e",
        textColor: "#d9d5c9",
        accent: "#f2ede0",
        cards: [
            {
                id: "t-ronny-1",
                headline: "Gregorio Avanzini is a warrior of light.",
                body: "I have no doubt he will help humanity going forward, in an amazing matter, by empowering others to reconnect to their hearts and souls.",
                name: "Ronny Turiaf",
                subtitle: "NBA Champion | Former LA Lakers Player",
                avatarInitials: "RT",
                width: 330,
                top: 20,
                left: 78,
                layer: "front",
                rotate: -2,
                scale: 1,
                from: { x: 220, y: -140 },
                speed: 0.85,
                driftAmplitude: 14,
                driftPhase: 0.2,
            },
            {
                id: "t-jeffrey-1",
                headline: "Gregorio will guide you through the fear and into the truth.",
                body: "I have come to realize that we are here to learn how to love, period. For those of us that have the courage to truly commit to this mandate, choose Gregorio as your coach.",
                name: "Jeffrey Perlman",
                subtitle: "CSO - Mindvalley | Former Global CMO - Zumba",
                avatarInitials: "JP",
                width: 320,
                top: 70,
                left: 20,
                layer: "back",
                rotate: 2,
                scale: 1,
                from: { x: -200, y: 160 },
                speed: 1.1,
                driftAmplitude: 12,
                driftPhase: 1.6,
            },
            {
                id: "t-ronny-2",
                headline: "Gregorio Avanzini is a warrior of light.",
                body: "My life changed for the better by crossing paths with him.",
                name: "Ronny Turiaf",
                subtitle: "NBA Champion | Former LA Lakers Player",
                avatarInitials: "RT",
                width: 300,
                top: 78,
                left: 62,
                layer: "front",
                rotate: 3,
                scale: 0.95,
                from: { x: 180, y: 160 },
                speed: 1.0,
                driftAmplitude: 12,
                driftPhase: 2.8,
            },
            {
                id: "t-jeffrey-2",
                headline: "Choose Gregorio as your coach.",
                body: "We are here to learn how to love, period.",
                name: "Jeffrey Perlman",
                subtitle: "CSO - Mindvalley | Former Global CMO - Zumba",
                avatarInitials: "JP",
                width: 290,
                top: 16,
                left: 38,
                layer: "back",
                rotate: -3,
                scale: 0.95,
                from: { x: -160, y: -180 },
                speed: 1.3,
                driftAmplitude: 16,
                driftPhase: 3.5,
            },
        ],
        mobileCards: [
            {
                id: "t-ronny-1-m",
                headline: "Gregorio Avanzini is a warrior of light.",
                body: "I have no doubt he will help humanity going forward, in an amazing matter.",
                name: "Ronny Turiaf",
                subtitle: "NBA Champion | Former LA Lakers Player",
                avatarInitials: "RT",
                width: 240,
                top: 16,
                left: 76,
                layer: "front",
                rotate: -2,
                scale: 1,
                from: { x: 130, y: -90 },
                speed: 0.85,
                driftAmplitude: 8,
                driftPhase: 0.2,
            },
            {
                id: "t-jeffrey-1-m",
                headline: "Gregorio will guide you through the fear and into the truth.",
                body: "We are here to learn how to love, period.",
                name: "Jeffrey Perlman",
                subtitle: "CSO - Mindvalley | Former Global CMO - Zumba",
                avatarInitials: "JP",
                width: 225,
                top: 70,
                left: 24,
                layer: "back",
                rotate: 2,
                scale: 1,
                from: { x: -110, y: 100 },
                speed: 1.1,
                driftAmplitude: 8,
                driftPhase: 1.6,
            },
            {
                id: "t-ronny-2-m",
                headline: "A warrior of light.",
                body: "My life changed for the better by crossing paths with him.",
                name: "Ronny Turiaf",
                subtitle: "NBA Champion",
                avatarInitials: "RT",
                width: 210,
                top: 82,
                left: 64,
                layer: "front",
                rotate: 3,
                scale: 0.95,
                from: { x: 110, y: 100 },
                speed: 1.0,
                driftAmplitude: 8,
                driftPhase: 2.8,
            },
            {
                id: "t-jeffrey-2-m",
                headline: "Choose Gregorio as your coach.",
                body: "We are here to learn how to love.",
                name: "Jeffrey Perlman",
                subtitle: "CSO - Mindvalley",
                avatarInitials: "JP",
                width: 205,
                top: 12,
                left: 36,
                layer: "back",
                rotate: -3,
                scale: 0.95,
                from: { x: -100, y: -110 },
                speed: 1.3,
                driftAmplitude: 8,
                driftPhase: 3.5,
            },
        ],
        extraCard: {
            id: "t-ronny-3",
            headline: "A warrior of light.",
            body: "Empowering others to reconnect to their hearts and souls.",
            name: "Ronny Turiaf",
            subtitle: "NBA Champion | Former LA Lakers Player",
            avatarInitials: "RT",
            width: 230,
            layer: "front",
            rotate: 4,
            scale: 0.88,
            from: { x: 0, y: 150 },
            speed: 1.05,
            driftAmplitude: 10,
            driftPhase: 0.9,
        },
        extraMobileCard: {
            id: "t-ronny-3-m",
            headline: "A warrior of light.",
            body: "Reconnect to your heart and soul.",
            name: "Ronny Turiaf",
            subtitle: "NBA Champion",
            avatarInitials: "RT",
            width: 170,
            layer: "front",
            rotate: 4,
            scale: 0.88,
            from: { x: 0, y: 100 },
            speed: 1.05,
            driftAmplitude: 8,
            driftPhase: 0.9,
        },
    },
    {
        id: "02",
        label: "02",
        word: "02",
        background: "#ded6c8",
        textColor: "#2c2924",
        accent: "#171512",
        cards: [
            {
                id: "t-jess-1",
                headline: "An incredible experience, unlike anything I've ever tried.",
                body: "It was a deep, intense, and a powerful way to blow past the constraints of the mind into greater awareness.",
                name: "Jess Lively",
                subtitle: "Founder - The Lively Show",
                avatarInitials: "JL",
                width: 320,
                top: 18,
                left: 24,
                layer: "front",
                rotate: -3,
                scale: 1,
                from: { x: -200, y: -140 },
                speed: 0.9,
                driftAmplitude: 14,
                driftPhase: 0.5,
            },
            {
                id: "t-david-1",
                headline: "An experience of union, liberation, power, and surrender.",
                body: "Gregorio will guide you on one of the most magical journeys of your life.",
                name: "David Block",
                subtitle: "Composer/Producer - The Human Experience - Gone Gone Beyond",
                avatarInitials: "DB",
                width: 320,
                top: 70,
                left: 76,
                layer: "back",
                rotate: 3,
                scale: 1,
                from: { x: 200, y: 160 },
                speed: 1.15,
                driftAmplitude: 12,
                driftPhase: 2.0,
            },
            {
                id: "t-jess-2",
                headline: "Blow past the constraints of the mind.",
                body: "Into greater awareness.",
                name: "Jess Lively",
                subtitle: "Founder - The Lively Show",
                avatarInitials: "JL",
                width: 280,
                top: 80,
                left: 40,
                layer: "front",
                rotate: 2,
                scale: 0.95,
                from: { x: -160, y: 170 },
                speed: 1.05,
                driftAmplitude: 12,
                driftPhase: 3.1,
            },
            {
                id: "t-david-2",
                headline: "One of the most magical journeys of your life.",
                body: "Union, liberation, power, and surrender.",
                name: "David Block",
                subtitle: "Composer/Producer - The Human Experience",
                avatarInitials: "DB",
                width: 290,
                top: 14,
                left: 62,
                layer: "back",
                rotate: -2,
                scale: 0.95,
                from: { x: 170, y: -160 },
                speed: 1.25,
                driftAmplitude: 16,
                driftPhase: 1.1,
            },
        ],
        mobileCards: [
            {
                id: "t-jess-1-m",
                headline: "An incredible experience, unlike anything I've ever tried.",
                body: "A deep, intense, and powerful way to blow past the constraints of the mind.",
                name: "Jess Lively",
                subtitle: "Founder - The Lively Show",
                avatarInitials: "JL",
                width: 230,
                top: 16,
                left: 28,
                layer: "front",
                rotate: -3,
                scale: 1,
                from: { x: -110, y: -90 },
                speed: 0.9,
                driftAmplitude: 8,
                driftPhase: 0.5,
            },
            {
                id: "t-david-1-m",
                headline: "An experience of union, liberation, power, and surrender.",
                body: "One of the most magical journeys of your life.",
                name: "David Block",
                subtitle: "Composer/Producer - The Human Experience",
                avatarInitials: "DB",
                width: 220,
                top: 72,
                left: 72,
                layer: "back",
                rotate: 3,
                scale: 1,
                from: { x: 110, y: 100 },
                speed: 1.15,
                driftAmplitude: 8,
                driftPhase: 2.0,
            },
            {
                id: "t-jess-2-m",
                headline: "Blow past the constraints of the mind.",
                body: "Into greater awareness.",
                name: "Jess Lively",
                subtitle: "Founder - The Lively Show",
                avatarInitials: "JL",
                width: 200,
                top: 84,
                left: 40,
                layer: "front",
                rotate: 2,
                scale: 0.95,
                from: { x: -100, y: 110 },
                speed: 1.05,
                driftAmplitude: 8,
                driftPhase: 3.1,
            },
            {
                id: "t-david-2-m",
                headline: "A magical journey.",
                body: "Union, liberation, power, and surrender.",
                name: "David Block",
                subtitle: "Composer/Producer",
                avatarInitials: "DB",
                width: 200,
                top: 12,
                left: 62,
                layer: "back",
                rotate: -2,
                scale: 0.95,
                from: { x: 100, y: -100 },
                speed: 1.25,
                driftAmplitude: 8,
                driftPhase: 1.1,
            },
        ],
        extraCard: {
            id: "t-jess-3",
            headline: "An incredible experience.",
            body: "Unlike anything I've ever tried.",
            name: "Jess Lively",
            subtitle: "Founder - The Lively Show",
            avatarInitials: "JL",
            width: 220,
            layer: "front",
            rotate: 4,
            scale: 0.88,
            from: { x: 0, y: 150 },
            speed: 1.05,
            driftAmplitude: 10,
            driftPhase: 1.4,
        },
        extraMobileCard: {
            id: "t-jess-3-m",
            headline: "An incredible experience.",
            body: "Unlike anything I've ever tried.",
            name: "Jess Lively",
            subtitle: "Founder - The Lively Show",
            avatarInitials: "JL",
            width: 165,
            layer: "front",
            rotate: 4,
            scale: 0.88,
            from: { x: 0, y: 100 },
            speed: 1.05,
            driftAmplitude: 8,
            driftPhase: 1.4,
        },
    },
    {
        id: "03",
        label: "03",
        word: "03",
        background: "#211f1b",
        textColor: "#eee9dd",
        accent: "#e7c98a",
        cards: [
            {
                id: "t-mark-1",
                headline: "Coaching with Gregorio has brought new heights to my life.",
                body: 'He guides from the heart a profound way of thinking that can only be described as "Gregorio".',
                name: "Mark Lawrence",
                subtitle: "Founder and CEO - SpotHero",
                avatarInitials: "ML",
                width: 330,
                top: 16,
                left: 72,
                layer: "front",
                rotate: 2,
                scale: 1,
                from: { x: 220, y: -150 },
                speed: 0.9,
                driftAmplitude: 16,
                driftPhase: 0.4,
            },
            {
                id: "t-nadav-1",
                headline: "Breathwork with Gregorio changed my life forever.",
                body: "I saw that there's more than just our bodies and that I could go there anytime through meditation.",
                name: "Nadav Wilf",
                subtitle: "Founder and CEO - Head Alignment Coach | Former Chief Possibilities Officer - HeroX",
                avatarInitials: "NW",
                width: 320,
                top: 70,
                left: 24,
                layer: "back",
                rotate: -2,
                scale: 1,
                from: { x: -210, y: 160 },
                speed: 1.2,
                driftAmplitude: 14,
                driftPhase: 1.9,
            },
            {
                id: "t-mark-2",
                headline: "He exudes warm energy.",
                body: "Allows you to open up to find your inner truth.",
                name: "Mark Lawrence",
                subtitle: "Founder and CEO - SpotHero",
                avatarInitials: "ML",
                width: 280,
                top: 82,
                left: 60,
                layer: "front",
                rotate: -2,
                scale: 0.95,
                from: { x: 180, y: 170 },
                speed: 1.0,
                driftAmplitude: 12,
                driftPhase: 3.0,
            },
            {
                id: "t-nadav-2",
                headline: "A pure-hearted masterful facilitator.",
                body: "Will take you to new heights.",
                name: "Nadav Wilf",
                subtitle: "Founder and CEO - Head Alignment Coach",
                avatarInitials: "NW",
                width: 280,
                top: 12,
                left: 36,
                layer: "back",
                rotate: 3,
                scale: 0.95,
                from: { x: -170, y: -170 },
                speed: 1.3,
                driftAmplitude: 16,
                driftPhase: 2.6,
            },
        ],
        mobileCards: [
            {
                id: "t-mark-1-m",
                headline: "Coaching with Gregorio has brought new heights to my life.",
                body: 'A profound way of thinking that can only be described as "Gregorio".',
                name: "Mark Lawrence",
                subtitle: "Founder and CEO - SpotHero",
                avatarInitials: "ML",
                width: 235,
                top: 14,
                left: 72,
                layer: "front",
                rotate: 2,
                scale: 1,
                from: { x: 120, y: -100 },
                speed: 0.9,
                driftAmplitude: 8,
                driftPhase: 0.4,
            },
            {
                id: "t-nadav-1-m",
                headline: "Breathwork with Gregorio changed my life forever.",
                body: "There's more than just our bodies.",
                name: "Nadav Wilf",
                subtitle: "Founder and CEO - Head Alignment Coach",
                avatarInitials: "NW",
                width: 220,
                top: 72,
                left: 26,
                layer: "back",
                rotate: -2,
                scale: 1,
                from: { x: -110, y: 100 },
                speed: 1.2,
                driftAmplitude: 8,
                driftPhase: 1.9,
            },
            {
                id: "t-mark-2-m",
                headline: "He exudes warm energy.",
                body: "Find your inner truth.",
                name: "Mark Lawrence",
                subtitle: "Founder and CEO - SpotHero",
                avatarInitials: "ML",
                width: 195,
                top: 86,
                left: 60,
                layer: "front",
                rotate: -2,
                scale: 0.95,
                from: { x: 100, y: 110 },
                speed: 1.0,
                driftAmplitude: 8,
                driftPhase: 3.0,
            },
            {
                id: "t-nadav-2-m",
                headline: "A pure-hearted masterful facilitator.",
                body: "New heights.",
                name: "Nadav Wilf",
                subtitle: "Head Alignment Coach",
                avatarInitials: "NW",
                width: 195,
                top: 10,
                left: 36,
                layer: "back",
                rotate: 3,
                scale: 0.95,
                from: { x: -100, y: -100 },
                speed: 1.3,
                driftAmplitude: 8,
                driftPhase: 2.6,
            },
        ],
        extraCard: {
            id: "t-mark-3",
            headline: "New heights to my life.",
            body: "A profound way of thinking.",
            name: "Mark Lawrence",
            subtitle: "Founder and CEO - SpotHero",
            avatarInitials: "ML",
            width: 220,
            layer: "front",
            rotate: 4,
            scale: 0.88,
            from: { x: 0, y: 150 },
            speed: 1.05,
            driftAmplitude: 10,
            driftPhase: 1.8,
        },
        extraMobileCard: {
            id: "t-mark-3-m",
            headline: "New heights to my life.",
            body: "A profound way of thinking.",
            name: "Mark Lawrence",
            subtitle: "Founder and CEO - SpotHero",
            avatarInitials: "ML",
            width: 165,
            layer: "front",
            rotate: 4,
            scale: 0.88,
            from: { x: 0, y: 100 },
            speed: 1.05,
            driftAmplitude: 8,
            driftPhase: 1.8,
        },
    },
    {
        id: "04",
        label: "04",
        word: "04",
        background: "#e7e0d3",
        textColor: "#211e19",
        accent: "#8a6a4f",
        cards: [
            {
                id: "t-mario-1",
                headline: "Driven by professionals like Gregorio and Andrea.",
                body: "You'll be part of a wide and energetic experience — unsuspected intimate and refreshing stream of emotion.",
                name: "Mario Almondo",
                subtitle: "GM Performance Division - Brembo S.p.A | Former COO SVP - Ferrari S.p.A",
                avatarInitials: "MA",
                width: 340,
                top: 18,
                left: 26,
                layer: "front",
                rotate: -2,
                scale: 1,
                from: { x: -210, y: -140 },
                speed: 0.85,
                driftAmplitude: 15,
                driftPhase: 0.6,
            },
            {
                id: "t-helena-1",
                headline: "I had one of the craziest experiences of my life.",
                body: "I experienced the oneness I had just read about and felt deeply connected with everyone in the world.",
                name: "Helena Wasserman Erikson",
                subtitle: "Impact Investor | TEDx Speaker | Forbes 30 under 30",
                avatarInitials: "HW",
                width: 320,
                top: 70,
                left: 74,
                layer: "back",
                rotate: 3,
                scale: 1,
                from: { x: 210, y: 150 },
                speed: 1.1,
                driftAmplitude: 13,
                driftPhase: 2.3,
            },
            {
                id: "t-mario-2",
                headline: "Good food for the soul.",
                body: "An unsuspected intimate and refreshing stream of emotion.",
                name: "Mario Almondo",
                subtitle: "GM Performance Division - Brembo S.p.A",
                avatarInitials: "MA",
                width: 280,
                top: 80,
                left: 40,
                layer: "front",
                rotate: 2,
                scale: 0.95,
                from: { x: -170, y: 170 },
                speed: 1.0,
                driftAmplitude: 12,
                driftPhase: 3.2,
            },
            {
                id: "t-helena-2",
                headline: "Deeply connected with everyone in the world.",
                body: "One of the craziest experiences of my life.",
                name: "Helena Wasserman Erikson",
                subtitle: "Impact Investor | TEDx Speaker",
                avatarInitials: "HW",
                width: 280,
                top: 14,
                left: 60,
                layer: "back",
                rotate: -3,
                scale: 0.95,
                from: { x: 170, y: -160 },
                speed: 1.25,
                driftAmplitude: 16,
                driftPhase: 1.3,
            },
        ],
        mobileCards: [
            {
                id: "t-mario-1-m",
                headline: "You'll be part of a wide and energetic experience.",
                body: "An unsuspected intimate and refreshing stream of emotion.",
                name: "Mario Almondo",
                subtitle: "GM Performance Division - Brembo S.p.A",
                avatarInitials: "MA",
                width: 235,
                top: 16,
                left: 26,
                layer: "front",
                rotate: -2,
                scale: 1,
                from: { x: -120, y: -90 },
                speed: 0.85,
                driftAmplitude: 8,
                driftPhase: 0.6,
            },
            {
                id: "t-helena-1-m",
                headline: "I had one of the craziest experiences of my life.",
                body: "Deeply connected with everyone in the world.",
                name: "Helena Wasserman Erikson",
                subtitle: "Impact Investor | TEDx Speaker",
                avatarInitials: "HW",
                width: 220,
                top: 72,
                left: 74,
                layer: "back",
                rotate: 3,
                scale: 1,
                from: { x: 110, y: 100 },
                speed: 1.1,
                driftAmplitude: 8,
                driftPhase: 2.3,
            },
            {
                id: "t-mario-2-m",
                headline: "Good food for the soul.",
                body: "A refreshing stream of emotion.",
                name: "Mario Almondo",
                subtitle: "GM Performance Division",
                avatarInitials: "MA",
                width: 195,
                top: 84,
                left: 40,
                layer: "front",
                rotate: 2,
                scale: 0.95,
                from: { x: -100, y: 110 },
                speed: 1.0,
                driftAmplitude: 8,
                driftPhase: 3.2,
            },
            {
                id: "t-helena-2-m",
                headline: "Deeply connected with everyone.",
                body: "One of the craziest experiences of my life.",
                name: "Helena Wasserman Erikson",
                subtitle: "Impact Investor",
                avatarInitials: "HW",
                width: 195,
                top: 12,
                left: 60,
                layer: "back",
                rotate: -3,
                scale: 0.95,
                from: { x: 100, y: -100 },
                speed: 1.25,
                driftAmplitude: 8,
                driftPhase: 1.3,
            },
        ],
        extraCard: {
            id: "t-mario-3",
            headline: "A wide and energetic experience.",
            body: "A refreshing stream of emotion.",
            name: "Mario Almondo",
            subtitle: "GM Performance Division - Brembo S.p.A",
            avatarInitials: "MA",
            width: 220,
            layer: "front",
            rotate: 4,
            scale: 0.88,
            from: { x: 0, y: 150 },
            speed: 1.05,
            driftAmplitude: 10,
            driftPhase: 2.5,
        },
        extraMobileCard: {
            id: "t-mario-3-m",
            headline: "A wide and energetic experience.",
            body: "A refreshing stream of emotion.",
            name: "Mario Almondo",
            subtitle: "GM Performance Division",
            avatarInitials: "MA",
            width: 165,
            layer: "front",
            rotate: 4,
            scale: 0.88,
            from: { x: 0, y: 100 },
            speed: 1.05,
            driftAmplitude: 8,
            driftPhase: 2.5,
        },
    },
    {
        id: "05",
        label: "05",
        word: "05",
        background: "#22261f",
        textColor: "#e7e3d6",
        accent: "#c9b48a",
        cards: [
            {
                id: "t-andrea-1",
                headline: "A transformational experience that will unlock your hidden energy.",
                body: "Unlike many 'holistic' practices, it's rooted in science. A mind-bending journey, inspiring even the most skeptical.",
                name: "Andrea Aicaradi",
                subtitle: "VP of Growth - Neosensory Inc. | MIT Graduate",
                avatarInitials: "AA",
                width: 320,
                top: 16,
                left: 74,
                layer: "front",
                rotate: 2,
                scale: 1,
                from: { x: 220, y: -140 },
                speed: 0.9,
                driftAmplitude: 15,
                driftPhase: 0.5,
            },
            {
                id: "t-andy-1",
                headline: "I highly recommend coaching with Gregorio!",
                body: "He unlocked new doors and advanced me tremendously, finding surprisingly simple truths and new approaches.",
                name: "Andy Kaul",
                subtitle: "Manager - Microsoft Consulting | Former Director SAM - Microsoft",
                avatarInitials: "AK",
                width: 330,
                top: 70,
                left: 24,
                layer: "back",
                rotate: -3,
                scale: 1,
                from: { x: -210, y: 150 },
                speed: 1.15,
                driftAmplitude: 14,
                driftPhase: 2.1,
            },
            {
                id: "t-andrea-2",
                headline: "A mind-bending journey.",
                body: "Inspiring even the most skeptical.",
                name: "Andrea Aicaradi",
                subtitle: "VP of Growth - Neosensory Inc.",
                avatarInitials: "AA",
                width: 270,
                top: 82,
                left: 60,
                layer: "front",
                rotate: -2,
                scale: 0.95,
                from: { x: 170, y: 170 },
                speed: 1.0,
                driftAmplitude: 12,
                driftPhase: 3.4,
            },
            {
                id: "t-andy-2",
                headline: "Embraced by a bubble of trust.",
                body: "I opened up quickly and effortlessly.",
                name: "Andy Kaul",
                subtitle: "Manager - Microsoft Consulting",
                avatarInitials: "AK",
                width: 270,
                top: 12,
                left: 40,
                layer: "back",
                rotate: 3,
                scale: 0.95,
                from: { x: -170, y: -160 },
                speed: 1.3,
                driftAmplitude: 16,
                driftPhase: 1.0,
            },
        ],
        mobileCards: [
            {
                id: "t-andrea-1-m",
                headline: "A transformational experience that will unlock your hidden energy.",
                body: "Rooted in science, inspiring even the most skeptical.",
                name: "Andrea Aicaradi",
                subtitle: "VP of Growth - Neosensory Inc.",
                avatarInitials: "AA",
                width: 225,
                top: 14,
                left: 72,
                layer: "front",
                rotate: 2,
                scale: 1,
                from: { x: 120, y: -90 },
                speed: 0.9,
                driftAmplitude: 8,
                driftPhase: 0.5,
            },
            {
                id: "t-andy-1-m",
                headline: "I highly recommend coaching with Gregorio!",
                body: "He unlocked new doors and advanced me tremendously.",
                name: "Andy Kaul",
                subtitle: "Manager - Microsoft Consulting",
                avatarInitials: "AK",
                width: 230,
                top: 72,
                left: 26,
                layer: "back",
                rotate: -3,
                scale: 1,
                from: { x: -110, y: 100 },
                speed: 1.15,
                driftAmplitude: 8,
                driftPhase: 2.1,
            },
            {
                id: "t-andrea-2-m",
                headline: "A mind-bending journey.",
                body: "Inspiring even the most skeptical.",
                name: "Andrea Aicaradi",
                subtitle: "VP of Growth",
                avatarInitials: "AA",
                width: 195,
                top: 86,
                left: 60,
                layer: "front",
                rotate: -2,
                scale: 0.95,
                from: { x: 100, y: 110 },
                speed: 1.0,
                driftAmplitude: 8,
                driftPhase: 3.4,
            },
            {
                id: "t-andy-2-m",
                headline: "Embraced by a bubble of trust.",
                body: "I opened up quickly and effortlessly.",
                name: "Andy Kaul",
                subtitle: "Microsoft Consulting",
                avatarInitials: "AK",
                width: 195,
                top: 10,
                left: 40,
                layer: "back",
                rotate: 3,
                scale: 0.95,
                from: { x: -100, y: -100 },
                speed: 1.3,
                driftAmplitude: 8,
                driftPhase: 1.0,
            },
        ],
        extraCard: {
            id: "t-andrea-3",
            headline: "A transformational experience.",
            body: "Rooted in science, inspiring even the most skeptical.",
            name: "Andrea Aicaradi",
            subtitle: "VP of Growth - Neosensory Inc.",
            avatarInitials: "AA",
            width: 220,
            layer: "front",
            rotate: 4,
            scale: 0.88,
            from: { x: 0, y: 150 },
            speed: 1.05,
            driftAmplitude: 10,
            driftPhase: 3.0,
        },
        extraMobileCard: {
            id: "t-andrea-3-m",
            headline: "A transformational experience.",
            body: "Rooted in science.",
            name: "Andrea Aicaradi",
            subtitle: "VP of Growth",
            avatarInitials: "AA",
            width: 165,
            layer: "front",
            rotate: 4,
            scale: 0.88,
            from: { x: 0, y: 100 },
            speed: 1.05,
            driftAmplitude: 8,
            driftPhase: 3.0,
        },
    },
];

export const CATEGORY_SCENES: CategoryScene[] = SCENE_DRAFTS.map(buildScene);

/** How many vh each category gets within the section's single scroll timeline. */
export const SCROLL_VH_PER_CATEGORY = 100;