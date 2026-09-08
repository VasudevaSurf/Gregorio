"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.8,
  direction = "up",
  distance = 40,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px -10% 0px" });

  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, opacity: 0 };
      case "down":
        return { y: -distance, opacity: 0 };
      case "left":
        return { x: distance, opacity: 0 };
      case "right":
        return { x: -distance, opacity: 0 };
      case "none":
        return { opacity: 0, scale: 0.96 };
      default:
        return { y: distance, opacity: 0 };
    }
  };

  const getAnimatePosition = () => {
    switch (direction) {
      case "up":
      case "down":
        return { y: 0, opacity: 1, scale: 1 };
      case "left":
      case "right":
        return { x: 0, opacity: 1, scale: 1 };
      case "none":
        return { opacity: 1, scale: 1 };
      default:
        return { y: 0, opacity: 1, scale: 1 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialPosition()}
      animate={isInView ? getAnimatePosition() : getInitialPosition()}
      transition={{
        duration,
        delay,
        ease: [0.215, 0.61, 0.355, 1], // Custom cubic-bezier for silky motion
      }}
      className={cn("will-change-transform transform-gpu", className)}
    >
      {children}
    </motion.div>
  );
}
