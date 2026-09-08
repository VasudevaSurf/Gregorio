import HeroSection from "@/components/sections/HeroSection";
import OverlappingNarrativeSection from "@/components/sections/OverlappingNarrativeSection";
import SectionThree from "@/components/sections/SectionThree";

export default function HomePage() {
  return (
    <div className="relative w-full bg-black min-h-screen">
      {/* Tier 1: Full-Screen Sticky Hero (z-0) */}
      <HeroSection />

      {/* Tier 2 & Tier 3 Overlapping Deck Wrapper */}
      <div className="relative z-10 w-full transform-gpu">
        
        {/* Header 1 (Top Half of GREGORIO): Sticky top-0, z-50 */}
        <div className="sticky top-0 z-50 w-full h-[32px] sm:h-[48px] md:h-[56px] bg-neutral-950 flex items-end justify-center overflow-hidden border-t border-white/15 shadow-2xl">
          <div className="relative h-full w-full flex items-end justify-center overflow-hidden">
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.3em] uppercase text-white leading-none select-none translate-y-[50%]">
              GREGORIO
            </h2>
          </div>
        </div>

        {/* Section 2 Card Content (z-10, sticky top-0) */}
        <div className="sticky top-0 z-10 min-h-screen w-full bg-neutral-950 text-white pb-8 overflow-hidden">
          <OverlappingNarrativeSection />
        </div>

        {/* Section 3 Container */}
        <div className="relative z-20 w-full">
          
          {/* Header 2 (Bottom Half of GREGORIO): Sticky top-32/48/56, z-50 */}
          <div className="sticky top-[32px] sm:top-[48px] md:top-[56px] z-50 w-full h-[32px] sm:h-[48px] md:h-[56px] bg-neutral-950 flex items-start justify-center overflow-hidden shadow-2xl">
            <div className="relative h-full w-full flex items-start justify-center overflow-hidden">
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-[0.3em] uppercase text-amber-200 leading-none select-none -translate-y-[50%]">
                GREGORIO
              </h2>
            </div>
          </div>

          {/* Section 3 Card Body (z-20) */}
          <div className="min-h-screen w-full bg-neutral-950 text-white border-t border-white/15 shadow-2xl pb-12 pt-4">
            <SectionThree />
          </div>

        </div>

      </div>
    </div>
  );
}
