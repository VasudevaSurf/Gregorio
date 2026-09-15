import HeroSection from "@/components/sections/HeroSection";
import OverlappingNarrativeSection from "@/components/sections/OverlappingNarrativeSection";
import SectionThree from "@/components/sections/SectionThree";
import SectionFive from "@/components/sections/SectionFive";

export default function HomePage() {
  return (
    <div className="relative w-full bg-black min-h-screen">
      {/* Tier 1: Full-Screen Sticky Hero (z-0) */}
      <HeroSection />

      {/* Tier 2 & Tier 3 Overlapping Deck Wrapper */}
      <div className="relative z-10 w-full transform-gpu">

        {/* Header 1 (Top Half of GREGORIO): Sticky top-0, z-50 */}
        <div className="sticky top-0 z-50 w-full h-[48px] sm:h-[64px] md:h-[80px] bg-neutral-950 flex items-end justify-center overflow-hidden border-t border-white/15 shadow-2xl">
          <div className="relative h-full w-full flex items-end justify-center overflow-hidden">
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.3em] uppercase text-white leading-none select-none translate-y-[50%]">
              GREGORIO
            </h2>
          </div>
        </div>

        {/* Section 2 Card Content (z-10) — plain wrapper only; OverlappingNarrativeSection
            owns its own tall scroll wrapper + inner sticky panel, exactly like SectionThree
            below. Must NOT be sticky / fixed-height / overflow-hidden here, or its extra
            scroll runway gets clipped and Section 3 slides in before the carousel finishes. */}
        <div className="relative z-10 w-full bg-neutral-950 text-white">
          <OverlappingNarrativeSection />
        </div>

        {/* Section 3 Container — pulled up by one viewport (Header 2 + body move
            together) so the section finishes covering the screen slightly BEFORE
            Section 2's sticky panel would start to release (releasing always takes
            ~1 viewport of scroll — unavoidable with CSS sticky). This way Section 2
            is already fully hidden underneath by the time it would otherwise start
            visibly moving, so it reads as frozen instead of drifting out from under
            Section 3 — and Header 2 arrives at the same time as the body behind it,
            right at Section 3's top, instead of appearing partway through. */}
        <div className="relative z-20 w-full -mt-[100vh]">

          {/* Header 2 (Bottom Half of GREGORIO): Sticky at 1x header-height, z-50 */}
          <div className="sticky top-[48px] sm:top-[64px] md:top-[80px] z-50 w-full h-[48px] sm:h-[64px] md:h-[80px] bg-neutral-950 flex items-start justify-center overflow-hidden shadow-2xl">
            <div className="relative h-full w-full flex items-start justify-center overflow-hidden">
              <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.3em] uppercase text-amber-200 leading-none select-none -translate-y-[50%]">
                GREGORIO
              </h2>
            </div>
          </div>

          {/* Section 3 body — plain, unpinned wrapper. Height is just
              whatever SectionThree's own stack of per-category sticky
              panels naturally adds up to (5 x (100vh + CARD_SCROLL_VH)).
              No overflow-hidden here: each category panel handles its own
              clipping internally, and putting overflow-hidden on an
              ancestor of a `position: sticky` element is worth avoiding
              since it can change what the sticky element sticks relative
              to in some browsers. */}
          <div className="relative z-10 w-full bg-neutral-950 text-white">
            <SectionThree />
          </div>

          {/* Section 4 & 5 nested deck — lives inside Section 3's container so it slides up and
              covers Section 3 exactly the way Section 3 covers Section 2 above */}
          <div className="relative z-20 w-full">

            {/* Header 3 (Top Half of WORLD): Sticky at 2x header-height, stacks below Headers 1 & 2, z-50 */}
            <div className="sticky top-[96px] sm:top-[128px] md:top-[160px] z-50 w-full h-[48px] sm:h-[64px] md:h-[80px] bg-neutral-950 flex items-end justify-center overflow-hidden shadow-2xl">
              <div className="relative h-full w-full flex items-end justify-center overflow-hidden">
                <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.3em] uppercase text-white leading-none select-none translate-y-[50%]">
                  WORLD
                </h2>
              </div>
            </div>

            {/* Section 5 Container */}
            <div className="relative z-20 w-full">

              {/* Header 4 (Bottom Half of WORLD): Sticky at 3x header-height, stacks below Header 3, z-50 */}
              <div className="sticky top-[144px] sm:top-[192px] md:top-[240px] z-50 w-full h-[48px] sm:h-[64px] md:h-[80px] bg-neutral-950 flex items-start justify-center overflow-hidden shadow-2xl">
                <div className="relative h-full w-full flex items-start justify-center overflow-hidden">
                  <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.3em] uppercase text-amber-200 leading-none select-none -translate-y-[50%]">
                    WORLD
                  </h2>
                </div>
              </div>

              {/* Section 5 Card Body (final — not sticky, nothing needs to overlay it) */}
              <div className="min-h-screen w-full bg-neutral-950 text-white shadow-2xl pb-12 pt-4">
                <SectionFive />
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}