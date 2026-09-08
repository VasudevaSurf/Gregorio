"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  containerClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  overlay?: boolean;
  overlayOpacity?: string;
}

export default function OptimizedVideo({
  src,
  poster,
  className,
  containerClassName,
  autoPlay = true,
  loop = true,
  muted = true,
  overlay = true,
  overlayOpacity = "bg-black/40",
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // IntersectionObserver to pause video when off-screen to keep 60FPS scroll smoothness
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (autoPlay) {
              video.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [autoPlay]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden bg-neutral-950 transform-gpu", containerClassName)}
    >
      {/* Background Poster Image rendering instantly */}
      {poster && (
        <img
          src={poster}
          alt="Video thumbnail"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            isReady && isPlaying ? "opacity-0" : "opacity-100"
          )}
          loading="eager"
        />
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop={loop}
        muted={muted}
        playsInline
        preload="metadata"
        onCanPlay={() => setIsReady(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-700 transform-gpu",
          isReady ? "opacity-100" : "opacity-0",
          className
        )}
      />

      {/* Aesthetic Overlay */}
      {overlay && <div className={cn("absolute inset-0 pointer-events-none", overlayOpacity)} />}
    </div>
  );
}
