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

const CARD_SPREAD = 0.94;

/** Uniform size multiplier applied to every testimonial card's configured
 *  width so cards breathe and maintain clean gaps across all viewports. */
const CARD_SIZE_SCALE = 1.28;

/** How much of each category's slice of the timeline is used to
 *  crossfade into / out of its neighbour. */
const CROSSFADE_FRACTION = 0.35;

/** How much each card's own fade is staggered relative to its siblings. */
const CARD_STAGGER = 0.12;

/** Smoothstep easing: slow-fast-slow instead of linear, for a gentler feel. */
function ease(x: number) {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}

/**
 * Responsive scale factor that keeps cards comfortably large and 100% readable
 * across smaller desktop, laptop, tablet, and mobile viewports.
 */
function useResponsiveScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const s =
        w >= DESKTOP_REFERENCE_WIDTH
          ? Math.min(1.15, w / DESKTOP_REFERENCE_WIDTH)
          : Math.max(0.58, Math.pow(w / DESKTOP_REFERENCE_WIDTH, 0.42));
      setScale(s);
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

const SMALL_SCREEN_POSITIONS = [
  { top: 12, left: 22, rotate: -1.5 },
  { top: 30, left: 78, rotate: 1.8 },
  { top: 54, left: 50, rotate: -1 },
  { top: 76, left: 22, rotate: 1.5 },
  { top: 94, left: 78, rotate: -2 },
];

function TestimonialCard({
  card,
  raw,
  sceneIndex,
  totalScenes,
  avatarColor,
  scale,
  cardIndex = 0,
}: {
  card: CardConfig | MobileCardConfig;
  raw: number;
  sceneIndex: number;
  totalScenes: number;
  avatarColor: string;
  scale: number;
  cardIndex?: number;
}) {
  const t = getCardTransform(raw, card, sceneIndex, totalScenes);

  if (t.opacity <= 0) return null;

  // Desktop metrics & position
  const pad = Math.max(16, Math.round(26 * scale));
  const gap = Math.max(10, Math.round(15 * scale));
  const avatarSize = Math.max(44, Math.round(62 * scale));
  const avatarFont = Math.max(13, Math.round(15 * scale));
  const headlineSize = Math.max(13.5, Math.round(16 * scale * 10) / 10);
  const nameSize = Math.max(12.5, Math.round(14.5 * scale * 10) / 10);
  const subtitleSize = Math.max(10, Math.round(11.5 * scale * 10) / 10);

  const topDesk = pulledIn(card.top);
  const leftDesk = pulledIn(card.left);
  const rotDesk = card.rotate;
  const cardWidthDesk = Math.round(card.width * CARD_SIZE_SCALE * scale);
  const scaledXDesk = Math.round((card.from?.x ?? 0) * 0.12 * scale);
  const scaledY = Math.round(t.y);

  // Mobile / small screen metrics & position (Minimal Goods 3-lane staggered alignment)
  const posMob = SMALL_SCREEN_POSITIONS[cardIndex % SMALL_SCREEN_POSITIONS.length];

  return (
    <div
      className="sec3-card-host absolute will-change-transform"
      style={
        {
          "--top-m": `${posMob.top}%`,
          "--left-m": `${posMob.left}%`,
          "--rot-m": `${posMob.rotate}deg`,
          "--w-m": "min(182px, 45vw)",
          "--x-m": "0px",

          "--top-d": `${topDesk}%`,
          "--left-d": `${leftDesk}%`,
          "--rot-d": `${rotDesk}deg`,
          "--w-d": `${cardWidthDesk}px`,
          "--x-d": `${scaledXDesk}px`,

          "--y": `${scaledY}px`,
          "--scale": t.scale,
          opacity: t.opacity,
          zIndex: card.layer === "front" ? 30 : 5,
          pointerEvents: Math.abs(scaledY) < 500 ? "auto" : "none",
        } as React.CSSProperties
      }
    >
      {/* Small resolutions (<1024px): Portrait vertical card with Minimal Goods editorial styling */}
      <div
        className="testimonial-card relative flex lg:hidden flex-col overflow-hidden"
        style={
          {
            borderRadius: "0px",
            padding: "15px 13px",
            gap: "9px",
            backgroundColor: "#fdfcf8",
            backgroundImage: "linear-gradient(165deg, #ffffff 0%, #fdfcf8 40%, #f7f4eb 100%)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 2px rgba(0,0,0,0.06), 0 12px 28px -8px rgba(0,0,0,0.30)",
            "--tm-accent": avatarColor,
          } as React.CSSProperties
        }
      >
        <div
          className="tm-accent-bar absolute top-0 left-2 right-2 h-[3px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${avatarColor}, transparent)`,
          }}
        />
        <div className="tm-sheen absolute inset-0 pointer-events-none" />

        {/* Top: Avatar Circle + Quote Badge */}
        <div className="flex items-center justify-between">
          <div
            className="tm-avatar shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-[12px]"
            style={{
              background: `linear-gradient(135deg, ${avatarColor}, ${shade(avatarColor, 0.35)})`,
              boxShadow: "0 0 0 2px rgba(255,255,255,0.7), 0 2px 6px rgba(0,0,0,0.20)",
            }}
          >
            {card.avatarInitials}
          </div>
          <span
            className="font-serif text-neutral-400 select-none text-[20px] leading-none opacity-40"
            aria-hidden="true"
          >
            “
          </span>
        </div>

        {/* Reviewer Name & Subtitle - full card width so NEVER truncated */}
        <div className="min-w-0">
          <p className="font-bold text-neutral-900 text-[12px] tracking-tight leading-snug">
            {card.name}
          </p>
          <p className="tracking-[0.08em] uppercase text-neutral-500 text-[8.5px] leading-snug mt-0.5">
            {card.subtitle}
          </p>
        </div>

        {/* Description underneath */}
        <div className="min-w-0">
          <p
            className="font-serif leading-[1.35] text-neutral-900 text-[11.5px]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            <span className="font-bold not-italic">'{card.headline}</span>{" "}
            <span className="italic font-normal text-neutral-700">{card.body}'</span>
          </p>
        </div>
      </div>

      {/* Desktop resolutions (>=1024px): Original horizontal card layout */}
      <div
        className="testimonial-card relative hidden lg:flex items-start overflow-hidden rounded-none"
        style={
          {
            borderRadius: "0px",
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
        <div
          className="tm-accent-bar absolute top-0 h-[3px]"
          style={{
            left: pad,
            right: pad,
            background: `linear-gradient(90deg, transparent, ${avatarColor}, transparent)`,
          }}
        />
        <div className="tm-sheen absolute inset-0 pointer-events-none" />

        <div
          className="tm-avatar shrink-0 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
          style={{
            width: avatarSize,
            height: avatarSize,
            fontSize: avatarFont,
            background: `linear-gradient(135deg, ${avatarColor}, ${shade(avatarColor, 0.35)})`,
            boxShadow: `0 0 0 ${Math.max(1, Math.round(3 * scale))}px rgba(255,255,255,0.65), 0 ${Math.max(1, Math.round(4 * scale))}px ${Math.max(2, Math.round(10 * scale))}px rgba(0,0,0,0.22)`,
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
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            <span className="font-bold not-italic">'{card.headline}</span>{" "}
            <span className="italic font-normal text-neutral-700">{card.body}'</span>
          </p>
          <p
            className="font-bold text-neutral-900 tracking-tight truncate"
            style={{ marginTop: Math.round(12 * scale), fontSize: nameSize }}
          >
            {card.name}
          </p>
          <p
            className="tracking-[0.15em] uppercase text-neutral-500 leading-snug truncate"
            style={{ fontSize: subtitleSize }}
          >
            {card.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SectionThree() {
  const scale = useResponsiveScale();
  const { lenis } = useSmoothScroll();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const count = CATEGORY_SCENES.length;
  const totalScrollVh = count * CARD_SCROLL_VH;

  // ONE continuous progress value across the whole section — keeps the
  // background a single pinned surface instead of re-pinning panels.
  const raw = useSceneScroll(wrapperRef);

  const activeIndex = Math.min(count - 1, Math.floor(raw * count));

  const jumpToCategory = (index: number) => {
    const el = wrapperRef.current;
    if (!el || !lenis) return;
    const target = el.offsetTop + (index / count) * (el.offsetHeight - window.innerHeight);
    lenis.scrollTo(target, { duration: 1.1 });
  };

  // Background + accent match the active category scene with smooth presence
  const sceneVisual = useMemo(
    () => ({
      bg: CATEGORY_SCENES[activeIndex]?.background ?? CATEGORY_SCENES[0].background,
      accent: CATEGORY_SCENES[activeIndex]?.accent ?? CATEGORY_SCENES[0].accent,
    }),
    [activeIndex]
  );

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
      transition: "background-color 400ms ease",
    };
  }, [sceneVisual]);

  return (
    <div className="relative w-full">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .sec3-card-host {
              top: var(--top-m);
              left: var(--left-m);
              width: var(--w-m);
              transform: translate3d(calc(-50% + var(--x-m, 0px)), calc(-50% + var(--y, 0px)), 0) rotate(var(--rot-m)) scale(var(--scale, 1));
            }
            @media (min-width: 640px) and (max-width: 1023px) {
              .sec3-card-host {
                width: min(225px, 28vw);
              }
            }
            @media (min-width: 1024px) {
              .sec3-card-host {
                top: var(--top-d);
                left: var(--left-d);
                width: var(--w-d);
                transform: translate3d(calc(-50% + var(--x-d, 0px)), calc(-50% + var(--y, 0px)), 0) rotate(var(--rot-d)) scale(var(--scale, 1));
              }
            }
          `,
        }}
      />
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
          <AmbientDecor accent={sceneVisual.accent} presence={1} />

          {CATEGORY_SCENES.map((scene, i) => {
            const cards = scene.cards;

            return (
              <React.Fragment key={scene.id}>
                {cards
                  .filter((c) => c.layer === "back")
                  .map((c, idx) => (
                    <TestimonialCard
                      key={c.id}
                      card={c}
                      raw={raw}
                      sceneIndex={i}
                      totalScenes={count}
                      avatarColor={scene.accent}
                      scale={scale}
                      cardIndex={idx}
                    />
                  ))}

                {cards
                  .filter((c) => c.layer === "front")
                  .map((c, idx) => (
                    <TestimonialCard
                      key={c.id}
                      card={c}
                      raw={raw}
                      sceneIndex={i}
                      totalScenes={count}
                      avatarColor={scene.accent}
                      scale={scale}
                      cardIndex={idx + 2}
                    />
                  ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}