import HeroSection from "@/components/sections/HeroSection";
import BrandShowcase from "@/components/sections/BrandShowcase";
import OverlappingNarrativeSection from "@/components/sections/OverlappingNarrativeSection";
import SectionThree from "@/components/sections/SectionThree";
import SectionFive from "@/components/sections/SectionFive";

export default function HomePage() {
  return (
    <div className="relative w-full bg-black min-h-screen">
      {/* Tier 1: Full-Screen Sticky Hero (z-0) */}
      <HeroSection />

      {/* Tier 2+ Overlapping Deck Wrapper */}
      <div className="relative z-10 w-full transform-gpu">

        {/* Header 1 (Top Half of GREGORIO): Sticky top-0, z-50
            Introduces the Brand Showcase section as the first card in the deck. */}
        <div className="sticky top-0 z-50 w-full h-[48px] sm:h-[64px] md:h-[80px] bg-neutral-950 flex items-center justify-center overflow-hidden border-t border-white/15 shadow-2xl">
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.3em] uppercase text-white leading-none select-none">
              DESIGN AND LIVE
            </h2>
          </div>
        </div>

        {/* Section 2: Brand Showcase (z-10) — short section with the dual-row
            infinite marquee. Owns its own tall wrapper + sticky panel (same
            pattern as every other section in this deck) so the next section
            can slide up and cover it using -mt-[100vh]. */}
        <div className="relative z-10 w-full bg-neutral-950 text-white">
          <BrandShowcase />
        </div>

        {/* Section 3 Container — slides up over Brand Showcase.
            Header 2 (GREGORIO bottom) arrives with this container. */}
        <div className="relative z-20 w-full -mt-[100vh]">

          {/* Header 2 (Bottom Half of GREGORIO): Sticky at 1x header-height, z-50 */}
          <div className="sticky top-[48px] sm:top-[64px] md:top-[80px] z-50 w-full h-[48px] sm:h-[64px] md:h-[80px] bg-neutral-950 flex items-end justify-center overflow-hidden shadow-2xl">
            <div className="relative h-full w-full flex items-end justify-center overflow-hidden">
              <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.3em] uppercase text-white leading-none select-none translate-y-[50%] whitespace-nowrap">
                THE LIFE OF YOUR
              </h2>
            </div>
          </div>

          {/* Section 3 body — OverlappingNarrativeSection (3D Carousel).
              Previously Section 2, now below both GREGORIO headers. */}
          <div className="relative z-10 w-full bg-neutral-950 text-white">
            <OverlappingNarrativeSection />
          </div>

          {/* Section 4+ Container — slides up over the 3D Carousel.
              Header 3 (WORLD top) arrives with this container. */}
          <div className="relative z-20 w-full -mt-[100vh]">

            {/* Header 3 (Top Half of WORLD): Sticky at 2x header-height, z-50 */}
            <div className="sticky top-[96px] sm:top-[128px] md:top-[160px] z-50 w-full h-[48px] sm:h-[64px] md:h-[80px] bg-neutral-950 flex items-start justify-center overflow-hidden shadow-2xl">
              <div className="relative h-full w-full flex items-start justify-center overflow-hidden">
                <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.3em] uppercase text-amber-200 leading-none select-none -translate-y-[50%] whitespace-nowrap">
                  THE LIFE OF YOUR
                </h2>
              </div>
            </div>

            {/* Section 4 body — SectionThree (testimonial categories).
                Previously Section 3, now below GREGORIO + WORLD top. */}
            <div className="relative z-10 w-full bg-neutral-950 text-white">
              <SectionThree />
            </div>

            {/* Section 5 nested deck — slides up over SectionThree.
                Header 4 (BEYOND) arrives with this container. */}
            <div className="relative z-20 w-full">

              {/* Header 4 (BEYOND): Sticky at 3x header-height, z-50.
                  A single full word (no split) — the final seal of the deck.
                  Uses a subtle gradient text instead of the split-clip pattern
                  above, since there is no matching bottom-half below it. */}
              <div className="sticky top-[144px] sm:top-[192px] md:top-[240px] z-50 w-full h-[48px] sm:h-[64px] md:h-[80px] bg-neutral-950 flex items-center justify-center overflow-hidden shadow-2xl">
                <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
                  <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.35em] uppercase leading-none select-none whitespace-nowrap bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent">
                    WILDEST DREAMS
                  </h2>
                </div>
              </div>

              {/* Section 5 body (final) — SectionFive */}
              <div className="relative z-20 w-full bg-neutral-950 text-white shadow-2xl">
                <SectionFive />
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}