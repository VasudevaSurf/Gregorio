"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { CATEGORY_SCENES } from "./section-three/categoryScenes";
import {
  useSceneScroll,
  getCardTransform,
  clamp01,
  CARD_SCROLL_VH,
} from "./section-three/useCategoryScroll";
import type { CardConfig, MobileCardConfig } from "./section-three/categoryScenes";

const DESKTOP_REFERENCE_WIDTH = 1440;

/** Below this width, the collage hands off to the simpler flow/carousel
 *  layout (see MobileSectionThree). Deliberately higher than a typical
 *  "phone" breakpoint: the collage needs real room to keep 5 independently
 *  positioned, readable cards apart, and narrow tablet/small-laptop widths
 *  don't have that room even at a reduced scale. */
const MOBILE_BREAKPOINT = 1024;

/** Floor for the collage's responsive scale (see useResponsiveScale) — the
 *  scale factor never drops below what the viewport is at exactly
 *  MOBILE_BREAKPOINT, since anything narrower hands off to the mobile
 *  layout anyway. Keeps cards from ever being asked to shrink past the
 *  point they were designed for. */
const MIN_COLLAGE_SCALE = MOBILE_BREAKPOINT / DESKTOP_REFERENCE_WIDTH;

const CARD_SPREAD = 0.78;

/** Uniform size multiplier applied to every testimonial card's configured
 *  width. Bump this to make all cards in the section bigger/smaller
 *  without having to touch each card's width in categoryScenes.ts. */
const CARD_SIZE_SCALE = 1.6;

/** How much of each category's own slice of the timeline (at the very
 *  start / end) is used to crossfade into / out of its neighbour. Bigger
 *  = slower, more peaceful transition. */
const CROSSFADE_FRACTION = 0.32;

/** How much each card's own fade is staggered relative to its siblings,
 *  as a fraction of the group's fade window. Cards ease in one after
 *  another instead of all popping to full opacity together — this is
 *  what removes the "white splash" of 4 white cards appearing at once. */
const CARD_STAGGER = 0.16;

/** Smoothstep easing: slow-fast-slow instead of linear, for a gentler feel. */
function ease(x: number) {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

/**
 * Everything about a card — its box width, padding, avatar size, and every
 * font size — needs to shrink TOGETHER as one unit as the viewport narrows.
 * Previously only the box width scaled continuously (via a vw-based CSS
 * clamp); padding/avatar/font size only had two fixed tiers (below/above
 * 640px). That mismatch is what caused overlap at "some resolutions": a
 * card given full-size text and avatar but a continuously narrowing box
 * wraps to more lines and grows taller than its hand-placed position ever
 * accounted for, so it intrudes on its neighbour.
 *
 * This hook returns a single scale factor, derived from the ACTUAL
 * viewport width (not a fixed CSS floor), that every size in a card is
 * multiplied by — so a card at any width down to MOBILE_BREAKPOINT is
 * always a uniformly-shrunk copy of the exact layout verified at desktop
 * size, never a distorted one.
 */
function useResponsiveScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const raw = window.innerWidth / DESKTOP_REFERENCE_WIDTH;
      setScale(Math.min(1, Math.max(MIN_COLLAGE_SCALE, raw)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
}

function pulledIn(pct: number) {
  return 50 + (pct - 50) * CARD_SPREAD;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const bigint = parseInt(full, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function mixColors(a: string, b: string, t: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bch = Math.round(ca.b + (cb.b - ca.b) * t);
  return `rgb(${r}, ${g}, ${bch})`;
}

/** Darkens a hex color toward black by `amt` (0..1). Used to derive a
 *  same-hue vignette edge and avatar gradient shading from a single
 *  configured color, so nothing new has to be added to categoryScenes.ts. */
function shade(hex: string, amt: number) {
  return mixColors(hex, "#000000", amt);
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Fine film-grain texture, blended over the flat background so it reads as
 *  a considered surface rather than a plain color fill. Pure CSS/SVG — no
 *  extra DOM nodes. */
const NOISE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>`;
const NOISE_URL = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")`;

/** Scattered positions (% of stage) for the slow-drifting light motes that
 *  live in the gaps between cards — spread toward the edges/corners the
 *  pulled-in cards never occupy, never near dead-center where the word
 *  sits. Each gets its own timing so the motion never repeats in sync. */
const AMBIENT_PARTICLES = [
  { left: 8, top: 18, duration: 13, delay: -2 },
  { left: 92, top: 22, duration: 16, delay: -6 },
  { left: 14, top: 72, duration: 14, delay: -9 },
  { left: 88, top: 68, duration: 18, delay: -1 },
  { left: 50, top: 12, duration: 15, delay: -11 },
  { left: 6, top: 46, duration: 17, delay: -4 },
  { left: 95, top: 48, duration: 12, delay: -7 },
];

/**
 * Fills the negative space between the section's cards with quiet, slow
 * motion instead of more content: a faint rotating orbit ring (echoes the
 * brand's circle/community mark), a few softly breathing glow blooms
 * tucked into the corners the pulled-in cards never reach, and a handful
 * of light motes drifting past. All decorative, all behind the cards
 * (z-index below them), and all disabled under prefers-reduced-motion.
 */
function AmbientDecor({ accent, presence }: { accent: string; presence: number }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ opacity: presence, zIndex: 1, pointerEvents: "none" }}
    >
      <svg
        className="orbit-ring absolute left-1/2 top-1/2"
        viewBox="0 0 100 100"
        style={{ width: "min(80vmin, 860px)", height: "min(80vmin, 860px)" }}
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke={accent} strokeOpacity="0.24" strokeWidth="0.15" strokeDasharray="0.6 2.6" />
        <circle cx="50" cy="50" r="35" fill="none" stroke={accent} strokeOpacity="0.15" strokeWidth="0.1" strokeDasharray="0.3 3.2" />
      </svg>

      <div className="ambient-orb ambient-orb--a" style={{ background: accent }} />
      <div className="ambient-orb ambient-orb--b" style={{ background: accent }} />
      <div className="ambient-orb ambient-orb--c" style={{ background: accent }} />

      {AMBIENT_PARTICLES.map((p, i) => (
        <span
          key={i}
          className="ambient-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: accent,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Remaps a category-wide `groupPresence` (0..1) into a per-card presence
 * that starts its own ramp slightly later than the card before it, so a
 * scene's 4 cards ease in/out as a soft cascade rather than snapping to
 * full opacity simultaneously.
 */
function staggeredPresence(groupPresence: number, index: number, total: number) {
  const offset = index * CARD_STAGGER;
  const span = Math.max(0.001, 1 - (total - 1) * CARD_STAGGER);
  const local = clamp01((groupPresence - offset) / span);
  return ease(local);
}

/**
 * One testimonial card. Position/rotation/drift still come from
 * getCardTransform (unchanged motion logic) — `presence` now drives this
 * card's own opacity + a subtle scale-in, independent of its siblings.
 *
 * `scale` (from useResponsiveScale) drives every internal size — padding,
 * avatar, and all three font sizes — in lockstep with the box width. That's
 * the fix for the "overlaps at some resolutions" bug: previously only the
 * width shrank continuously while these were fixed at one of two sizes, so
 * a card could end up with full-size text crammed into a narrow box,
 * wrapping taller than its hand-placed neighbour expected.
 */
function TestimonialCard({
  card,
  raw,
  presence,
  avatarColor,
  scale,
}: {
  card: CardConfig | MobileCardConfig;
  raw: number;
  presence: number;
  avatarColor: string;
  scale: number;
}) {
  const t = getCardTransform(raw, card);
  // Gentle scale-in from 0.92 -> 1 alongside the opacity fade, so cards
  // arrive softly instead of just blinking into existence.
  const arrivalScale = 0.92 + presence * 0.08;

  // Reference (desktop, scale = 1) pixel sizes for every internal metric —
  // multiplying all of them by the same `scale` is what keeps the card
  // looking like a clean shrink of the desktop design instead of a
  // distorted one, at any width down to MOBILE_BREAKPOINT.
  const pad = 36 * scale;
  const gap = 20 * scale;
  const radius = 26 * scale;
  const avatarSize = 80 * scale;
  const avatarFont = 18 * scale;
  const headlineSize = 19 * scale;
  const nameSize = 18 * scale;
  const subtitleSize = 14 * scale;

  return (
    <div
      className="absolute will-change-transform"
      style={{
        top: `${pulledIn(card.top)}%`,
        left: `${pulledIn(card.left)}%`,
        width: `${card.width * CARD_SIZE_SCALE * scale}px`,
        zIndex: card.layer === "front" ? 30 : 5,
        opacity: presence,
        transform: `translate3d(calc(-50% + ${t.x}px), calc(-50% + ${t.y}px), 0) rotate(${t.rotate}deg) scale(${t.scale * arrivalScale})`,
        pointerEvents: presence > 0.5 ? "auto" : "none",
      }}
    >
      <div
        className="testimonial-card relative flex items-start overflow-hidden"
        style={
          {
            borderRadius: `${radius}px`,
            padding: `${pad}px`,
            gap: `${gap}px`,
            backgroundColor: "#fdfcf8",
            backgroundImage: "linear-gradient(165deg, #ffffff 0%, #fdfcf8 40%, #f7f4eb 100%)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 2px rgba(0,0,0,0.06), 0 16px 32px -10px rgba(0,0,0,0.32), 0 30px 60px -20px rgba(0,0,0,0.35)",
            "--tm-accent": avatarColor,
            "--tm-scale": scale,
          } as React.CSSProperties
        }
      >
        {/* Thin glowing brand-accent line along the top edge — brightens on hover */}
        <div
          className="tm-accent-bar absolute top-0 h-[3px] rounded-full"
          style={{
            left: pad,
            right: pad,
            background: `linear-gradient(90deg, transparent, ${avatarColor}, transparent)`,
          }}
        />
        {/* Diagonal sheen that sweeps across the card on hover */}
        <div className="tm-sheen absolute inset-0 pointer-events-none" />

        {/* Swap this div for <OptimizedImage src={card.avatarSrc} .../> once real avatar photos are ready */}
        <div
          className="tm-avatar shrink-0 rounded-full flex items-center justify-center font-bold text-white"
          style={{
            width: avatarSize,
            height: avatarSize,
            fontSize: avatarFont,
            background: `linear-gradient(135deg, ${avatarColor}, ${shade(avatarColor, 0.35)})`,
            boxShadow: "0 0 0 3px rgba(255,255,255,0.65), 0 4px 10px rgba(0,0,0,0.22)",
          }}
        >
          {card.avatarInitials}
        </div>
        <div className="min-w-0 relative">
          <p
            className="font-serif leading-snug text-neutral-900"
            style={{
              fontSize: headlineSize,
              display: "-webkit-box",
              WebkitLineClamp: 6,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            <span className="font-bold not-italic">'{card.headline}</span>{" "}
            <span className="italic font-normal text-neutral-700">{card.body}'</span>
          </p>
          <p
            className="font-bold text-neutral-900 tracking-tight truncate"
            style={{ marginTop: 16 * scale, fontSize: nameSize }}
          >
            {card.name}
          </p>
          <p
            className="tracking-[0.15em] uppercase text-neutral-500 leading-snug"
            style={{ fontSize: subtitleSize }}
          >
            {card.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Small IntersectionObserver-based reveal hook — gives the mobile cards the
 * same "arrive with intent" feel as the desktop collage's presence-driven
 * fade/scale-in (staggered, settling into a slight tilt) without needing
 * any scroll-jacking or pinned panels.
 */
function useRevealed<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, revealed };
}

/**
 * One testimonial card for the mobile layout, styled and animated like a
 * sticky note pinned to a wall: a small "washi tape" strip at the top,
 * a slight resting tilt, and — the headline behaviour requested — it
 * isn't just faded in, it visibly DROPS from above and settles into place
 * (with a little overshoot/bounce, like landing and sticking) as it
 * scrolls into view. Still plain block-flow (no absolute positioning), so
 * it can never overlap its neighbours, and it's full-width so the text
 * never gets cramped.
 */
function MobileTestimonialCard({
  card,
  avatarColor,
  tilt,
  offsetX,
}: {
  card: CardConfig | MobileCardConfig;
  avatarColor: string;
  tilt: number;
  offsetX: number;
}) {
  const { ref, revealed } = useRevealed<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="testimonial-card relative mx-auto rounded-[22px] p-5 flex flex-col gap-4 overflow-hidden"
      style={{
        width: "88%",
        maxWidth: 380,
        backgroundColor: "#fdfcf8",
        backgroundImage: "linear-gradient(165deg, #ffffff 0%, #fdfcf8 40%, #f7f4eb 100%)",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 2px rgba(0,0,0,0.06), 0 16px 32px -10px rgba(0,0,0,0.32), 0 30px 60px -20px rgba(0,0,0,0.35)",
        opacity: revealed ? 1 : 0,
        // Falls from above and settles into its resting tilt/offset — the
        // overshoot easing (back-out curve) is what gives it the "lands
        // and sticks" bounce instead of a plain smooth slide.
        transform: revealed
          ? `translate(${offsetX}px, 0) rotate(${tilt}deg) scale(1)`
          : `translate(${offsetX}px, -64px) rotate(0deg) scale(0.92)`,
        transition: "opacity 0.45s ease, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Washi-tape strip pinning the note to the wall */}
      <div
        className="absolute -top-3 left-1/2 h-6 w-16 rounded-[2px] pointer-events-none"
        style={{
          transform: `translateX(-50%) rotate(${-tilt * 1.6}deg)`,
          background: withAlpha(avatarColor, 0.55),
          boxShadow: "0 2px 5px rgba(0,0,0,0.18)",
          zIndex: 2,
        }}
      />
      <div
        className="tm-accent-bar absolute top-0 left-9 right-9 h-[3px] rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${avatarColor}, transparent)` }}
      />
      <div className="flex items-center gap-3">
        <div
          className="tm-avatar shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${avatarColor}, ${shade(avatarColor, 0.35)})`,
            boxShadow: "0 0 0 3px rgba(255,255,255,0.65), 0 4px 10px rgba(0,0,0,0.22)",
          }}
        >
          {card.avatarInitials}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-neutral-900 tracking-tight truncate">{card.name}</p>
          <p className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 leading-snug">
            {card.subtitle}
          </p>
        </div>
      </div>
      <p
        className="font-serif text-[15px] leading-snug text-neutral-900"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 6,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        <span className="font-bold not-italic">'{card.headline}</span>{" "}
        <span className="italic font-normal text-neutral-700">{card.body}'</span>
      </p>
    </div>
  );
}

/**
 * Mobile/small-screen version of Section Three. The desktop version relies
 * on absolute-positioned, percentage-placed cards sized off a 1440px
 * reference width — that math simply doesn't hold up on a narrow phone
 * screen, which is why cards were overlapping. Rather than patch the
 * collage math for every viewport size, mobile gets a simpler, safer
 * layout: each category is a normal-flow vertical stack of full-width
 * "sticky note" cards, each dropping in and settling at a slight, alternating
 * tilt as you scroll past it — like notes pinned to a wall one after
 * another, instead of a flat horizontal swipe strip. Nothing is absolutely
 * positioned, so overlap is impossible at any width, and no card is ever
 * squeezed smaller than the others to fit a row.
 */
function MobileSectionThree() {
  return (
    <div className="relative w-full">
      {CATEGORY_SCENES.map((scene) => (
        <div
          key={scene.id}
          className="relative w-full py-16 overflow-hidden"
          style={{ backgroundColor: scene.background }}
        >
          <div className="px-5 mb-8">
            <h2
              className="font-sans font-extrabold leading-[0.85] select-none"
              style={{
                color: scene.textColor,
                fontSize: "clamp(2.75rem, 16vw, 4.5rem)",
                letterSpacing: "-0.03em",
                WebkitTextStrokeWidth: "1px",
                WebkitTextStrokeColor: withAlpha(scene.accent, 0.55),
              }}
            >
              {scene.word}
            </h2>
          </div>
          <div className="flex flex-col gap-7 px-2">
            {scene.mobileCards.map((card, idx) => (
              <MobileTestimonialCard
                key={card.id}
                card={card}
                avatarColor={scene.accent}
                tilt={card.rotate * 0.6}
                offsetX={idx % 2 === 0 ? -10 : 10}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SectionThree() {
  const isMobile = useIsMobile();
  const scale = useResponsiveScale();
  const { lenis } = useSmoothScroll();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const count = CATEGORY_SCENES.length;
  const totalScrollVh = count * CARD_SCROLL_VH;

  // ONE continuous progress value across the whole section — keeps the
  // background a single pinned surface instead of re-pinning panels.
  const raw = useSceneScroll(wrapperRef);

  const segments = useMemo(() => {
    return CATEGORY_SCENES.map((_, i) => {
      const segStart = i / count;
      const segSize = 1 / count;
      const local = clamp01((raw - segStart) / segSize);
      const fadeIn = i === 0 ? 1 : clamp01(local / CROSSFADE_FRACTION);
      const fadeOut = i === count - 1 ? 1 : clamp01((1 - local) / CROSSFADE_FRACTION);
      return { local, presence: ease(Math.min(fadeIn, fadeOut)) };
    });
  }, [raw, count]);

  const activeIndex = Math.min(count - 1, Math.floor(raw * count));

  const jumpToCategory = (index: number) => {
    const el = wrapperRef.current;
    if (!el || !lenis) return;
    const target = el.offsetTop + (index / count) * (el.offsetHeight - window.innerHeight);
    lenis.scrollTo(target, { duration: 1.1 });
  };

  // Background + accent are eased through the same crossfade window as the
  // cards — one continuous surface, no separate sliding panel, no pop.
  const sceneVisual = useMemo(() => {
    const idx = activeIndex;
    const nextIdx = Math.min(count - 1, idx + 1);
    const cur = CATEGORY_SCENES[idx];
    if (idx === nextIdx) return { bg: cur.background, accent: cur.accent };
    const local = segments[idx].local;
    const transitionStart = 1 - CROSSFADE_FRACTION;
    if (local <= transitionStart) return { bg: cur.background, accent: cur.accent };
    const w = ease(clamp01((local - transitionStart) / CROSSFADE_FRACTION));
    const next = CATEGORY_SCENES[nextIdx];
    return {
      bg: mixColors(cur.background, next.background, w),
      accent: mixColors(cur.accent, next.accent, w),
    };
  }, [activeIndex, count, segments]);

  // Compose the flat background into a considered surface: fine grain for
  // texture, a warm glow of the category's own accent pooling behind the
  // giant word, a same-hue vignette for depth, and a soft top/bottom fade so
  // the pinned panel blends into the sections around it. All on the one
  // existing panel element — no extra layers added to the page.
  const panelStyle = useMemo<React.CSSProperties>(() => {
    const edge = shade(sceneVisual.bg, 0.32);
    const vignette = `radial-gradient(130% 110% at 50% 65%, ${sceneVisual.bg} 0%, ${edge} 100%)`;
    const glow = `radial-gradient(55% 45% at 50% 92%, ${withAlpha(sceneVisual.accent, 0.32)} 0%, rgba(0,0,0,0) 70%)`;
    const edgeFade =
      "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 86%, rgba(0,0,0,0.35) 100%)";
    return {
      backgroundColor: sceneVisual.bg,
      backgroundImage: `${NOISE_URL}, ${edgeFade}, ${glow}, ${vignette}`,
      backgroundBlendMode: "overlay, normal, soft-light, normal",
      backgroundSize: "160px 160px, 100% 100%, 100% 100%, 100% 100%",
    };
  }, [sceneVisual]);

  // Mobile gets the simpler, overlap-proof layout above — the pinned
  // scroll-jacked collage below is desktop-only. All hooks above still run
  // on every render (rules of hooks), this just swaps what gets returned.
  if (isMobile) {
    return <MobileSectionThree />;
  }

  return (
    <div className="relative w-full">

      {/* ONE tall wrapper for the entire section — the sticky panel inside
          pins exactly once, so the background never slides or swaps. */}
      <div
        ref={wrapperRef}
        className="relative w-full"
        style={{ height: `${100 + totalScrollVh}vh` }}
      >
        <div
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={panelStyle}
        >
          {CATEGORY_SCENES.map((scene, i) => {
            const seg = segments[i];
            if (seg.presence <= 0) return null;
            const cards = scene.cards;

            return (
              <div
                key={scene.id}
                className="absolute inset-0"
                style={{ pointerEvents: i === activeIndex ? "auto" : "none" }}
              >
                <AmbientDecor accent={scene.accent} presence={seg.presence} />

                {cards
                  .filter((c) => c.layer === "back")
                  .map((c, idx) => (
                    <TestimonialCard
                      key={c.id}
                      card={c}
                      raw={seg.local}
                      presence={staggeredPresence(seg.presence, idx, cards.length)}
                      avatarColor={scene.accent}
                      scale={scale}
                    />
                  ))}

                <div
                  className="absolute inset-x-0 bottom-[6%] sm:bottom-[8%] px-[4%] sm:px-[5%]"
                  style={{ zIndex: 20, opacity: seg.presence }}
                >
                  <h2
                    className="font-sans font-extrabold leading-[0.85] select-none"
                    style={{
                      color: scene.textColor,
                      fontSize: "clamp(3.5rem, 11vw, 10.5rem)",
                      letterSpacing: "-0.03em",
                      WebkitTextStrokeWidth: "1px",
                      WebkitTextStrokeColor: withAlpha(scene.accent, 0.55),
                      textShadow: `0 1px 0 rgba(0,0,0,0.08), 0 30px 50px rgba(0,0,0,0.28)`,
                    }}
                  >
                    {scene.word}
                  </h2>
                </div>

                {cards
                  .filter((c) => c.layer === "front")
                  .map((c, idx) => (
                    <TestimonialCard
                      key={c.id}
                      card={c}
                      raw={seg.local}
                      presence={staggeredPresence(seg.presence, idx, cards.length)}
                      avatarColor={scene.accent}
                      scale={scale}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}