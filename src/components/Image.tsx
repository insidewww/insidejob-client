import { useState } from "react";
import type { ImageRefSchema } from "../lib/content.types";

interface ImageProps {
  imageref: ImageRefSchema;
  className?: string;
  fallbackUrl?: string; // Optional custom fallback image URL
}

export default function Image({ imageref, className }: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span role="status">Image unavailable.</span>;
  return <img src={imageref.src} srcSet={imageref.srcSet} sizes={imageref.sizes || '(max-width: 767px) 100vw, 50vw'} alt={imageref.alt || ''} width={imageref.width} height={imageref.height} onError={() => setFailed(true)} className={className || 'img-fluid'} />;
}
