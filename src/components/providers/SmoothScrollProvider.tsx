"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollContextType {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const reqIdRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Instantiate Lenis with tuned momentum & easing parameters
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    setLenisInstance(lenis);

    // Sync Lenis with GSAP ScrollTrigger ONLY during active user scrolling (velocity !== 0)
    // to prevent ResizeObserver layout-shift feedback loops
    const onScroll = (e: { velocity: number }) => {
      if (e && Math.abs(e.velocity) > 0.001) {
        ScrollTrigger.update();
      }
    };
    lenis.on("scroll", onScroll);

    // 2. Continuous requestAnimationFrame loop
    function updateRaf(time: number) {
      lenis.raf(time);
      reqIdRef.current = requestAnimationFrame(updateRaf);
    }

    reqIdRef.current = requestAnimationFrame(updateRaf);

    // 3. Cleanup on unmount
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
