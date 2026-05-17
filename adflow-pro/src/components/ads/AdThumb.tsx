"use client";

import Image from "next/image";
import { useState } from "react";

export function AdThumb({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800/80 text-xs text-slate-500 ${className ?? ""}`}
      >
        Preview unavailable
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes="(max-width:768px) 100vw, 33vw"
      unoptimized={src.includes("picsum.photos")}
      onError={() => setBroken(true)}
    />
  );
}
