"use client";

import React, { useRef, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  magneticStrength?: number;
}

export default function MagneticButton({
  children,
  className,
  magneticStrength = 0.35,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const middleX = e.clientX - (left + width / 2);
    const middleY = e.clientY - (top + height / 2);
    setPosition({ x: middleX * magneticStrength, y: middleY * magneticStrength });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.1 }}
      className={cn(
        "relative inline-flex items-center justify-center px-8 py-4 text-xs font-semibold tracking-[0.2em] uppercase transition-colors duration-300 rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-md hover:bg-white hover:text-black hover:border-white transform-gpu cursor-pointer",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
