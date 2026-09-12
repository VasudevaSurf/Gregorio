"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import OptimizedImage from "../ui/OptimizedImage";

interface CarouselItem {
  id: string;
  image: string;
  alt: string;
  tag: string;
  title: string;
}

const items: CarouselItem[] = [
  {
    id: "01",
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop",
    alt: "Street style sneakers",
    tag: "STREET / IDENTITY",
    title: "MOMENTUM",
  },
  {
    id: "02",
    image:
      "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?q=80&w=1000&auto=format&fit=crop",
    alt: "Geometric architectural facade",
    tag: "PRODUCT / SYSTEM",
    title: "PRISM",
  },
  {
    id: "03",
    image:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1000&auto=format&fit=crop",
    alt: "Sculptural pavilion architecture",
    tag: "ARCHITECTURE / FORM",
    title: "ELYSIUM",
  },
  {
    id: "04",
    image:
      "https://images.unsplash.com/photo-1567016526105-22da7c13161a?q=80&w=1000&auto=format&fit=crop",
    alt: "Colorful packaging design",
    tag: "PACKAGING / COLOR",
    title: "SPECTRA",
  },
  {
    id: "05",
    image:
      "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1000&auto=format&fit=crop",
    alt: "Abstract glass and liquid art",
    tag: "ABSTRACT / MOTION",
    title: "LIQUID",
  },
  {
    id: "06",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop",
    alt: "Modern interior furniture design",
    tag: "INTERIOR / FORM",
    title: "MERIDIAN",
  },
  {
    id: "07",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop",
    alt: "Minimal workspace desk setup",
    tag: "DIGITAL / SYSTEM",
    title: "AXIOM",
  },
  {
    id: "08",
    image:
      "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1000&auto=format&fit=crop",
    alt: "Colorful abstract sneaker render",
    tag: "PRODUCT / FORM",
    title: "VERTEX",
  },
  {
    id: "09",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop",
    alt: "Modern chair studio shot",
    tag: "STUDIO / OBJECT",
    title: "CONTOUR",
  },
  {
    id: "10",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop",
    alt: "Deep blue gradient abstract surface",
    tag: "DIGITAL / ATMOSPHERE",
    title: "HALCYON",
  },
  {
    id: "11",
    image:
      "https://images.unsplash.com/photo-1618221118493-9cfa1a38c0a8?q=80&w=1000&auto=format&fit=crop",
    alt: "Minimalist product still life",
    tag: "STILL LIFE / OBJECT",
    title: "AURELIA",
  },
  {
    id: "12",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
    alt: "Warm toned architectural interior",
    tag: "INTERIOR / LIGHT",
    title: "EMBER",
  },
];

const TOTAL = items.length;
const ANGLE_STEP = 360 / TOTAL;

const titleVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? 44 : -44, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? -44 : 44, opacity: 0 }),
};

export default function OverlappingNarrativeSection() {
  // activeIndex: wrapped 0..TOTAL-1, used only to pick which item's title/content shows.
  const [activeIndex, setActiveIndex] = useState(2);
  // rotationStep: NEVER wrapped — keeps counting up or down forever. This is the only
  // value that drives rotateY, so the ring always keeps spinning the same physical
  // direction and never has to snap backward to "reset" to angle 0.
  const [rotationStep, setRotationStep] = useState(2);
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setRotationStep((prev) => prev + 1);
    setActiveIndex((prev) => (prev + 1) % TOTAL);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setRotationStep((prev) => prev - 1);
    setActiveIndex((prev) => (prev - 1 + TOTAL) % TOTAL);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((prevActive) => {
        // Shortest-path delta between current wrapped index and the clicked index,
        // e.g. clicking "1" while on "10" in a 12-item ring should step forward
        // 3 (10->11->0->1), not backward 9.
        let delta = index - prevActive;
        if (delta > TOTAL / 2) delta -= TOTAL;
        if (delta < -TOTAL / 2) delta += TOTAL;

        setDirection(delta >= 0 ? 1 : -1);
        setRotationStep((prevStep) => prevStep + delta);

        return index;
      });
    },
    []
  );

  // Smaller overall stage, and radius brought back down closer to cardWidth
  // so the gaps between front-row cards aren't too extreme.
  const radius = isMobile ? 320 : 620;
  const cardWidth = isMobile ? 140 : 240;
  const cardHeight = isMobile ? 200 : 360;

  return (
    <div className="relative w-full min-h-[70vh] sm:min-h-[75vh] flex flex-col items-center justify-center overflow-hidden py-8 sm:py-10">
      {/* 3D Carousel Stage */}
      <div
        className="relative w-full flex-1 flex items-center justify-center"
        style={{ perspective: "1600px" }}
      >
        {/* Rotating ring — driven by rotationStep, which counts endlessly in one
            direction instead of wrapping, so the ring never has to snap back to
            simulate a "reset". Each card underneath has a FIXED rotateY + translateZ
            that places it at its own position around the ring; the browser's real 3D
            perspective (not a manual sine approximation) naturally pushes receding
            cards outward and behind, so they peek through the gaps instead of hiding
            flush behind the front row. */}
        <motion.div
          className="relative"
          style={{ width: cardWidth, height: cardHeight, transformStyle: "preserve-3d" }}
          animate={{ rotateY: -rotationStep * ANGLE_STEP }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          {items.map((item, index) => {
            const fixedAngle = index * ANGLE_STEP;
            return (
              <div
                key={item.id}
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl cursor-pointer border border-white/10"
                style={{
                  transform: `rotateY(${fixedAngle}deg) translateZ(${radius}px)`,
                  // "visible" (not "hidden") lets cards on the far side of the ring
                  // keep rendering as they rotate past 90/180deg — since the face is
                  // flipped, it reads as a mirrored reflection showing through the
                  // gaps of the front-row cards instead of just vanishing.
                  backfaceVisibility: "visible",
                }}
                onClick={() => goTo(index)}
              >
                <OptimizedImage
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover"
                />
              </div>
            );
          })}
        </motion.div>

        {/* Center title + CTA overlay, always pinned above the ring.
            Slides bottom-to-top on "next", top-to-bottom on "prev". */}
        <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden pointer-events-none px-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={items[activeIndex].id}
              custom={direction}
              variants={titleVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
              className="flex flex-col items-center gap-6 sm:gap-8"
            >
              <h3 className="font-sans text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-white text-center drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                {items[activeIndex].title}
              </h3>

              <button className="pointer-events-auto px-6 sm:px-8 py-3 rounded-full bg-white text-black text-xs sm:text-sm font-bold uppercase tracking-[0.15em] hover:bg-amber-200 transition-colors">
                View Case
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Prev / Next controls */}
      <div className="flex items-center gap-4 mt-2 sm:mt-4 z-30">
        <button
          aria-label="Previous"
          onClick={goPrev}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-lime-400 hover:bg-lime-300 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <button
          aria-label="Next"
          onClick={goNext}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-lime-400 hover:bg-lime-300 flex items-center justify-center transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
}