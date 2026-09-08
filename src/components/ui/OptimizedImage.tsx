"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  wrapperClassName?: string;
  showSkeleton?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  showSkeleton = true,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isFill = Boolean(props.fill);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-neutral-900/60",
        isFill && "w-full h-full",
        wrapperClassName
      )}
    >
      {/* Skeleton loader animation before image load */}
      {showSkeleton && !isLoaded && (
        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900" />
      )}

      <Image
        src={src}
        alt={alt || "Media visual"}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        decoding="async"
        sizes={sizes}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "duration-700 ease-out transition-all transform-gpu",
          isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm",
          className
        )}
        {...props}
      />
    </div>
  );
}
