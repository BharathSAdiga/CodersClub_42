import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface CinematicHeroBackgroundProps {
  imageSrc?: string;
}

export const CinematicHeroBackground: React.FC<CinematicHeroBackgroundProps> = ({
  imageSrc = '/assets/images/msme_hero_cinematic.jpg',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll through the hero section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Buttery spring smoothing for organic deceleration curve
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.25,
    restDelta: 0.0005,
  });

  // Cinematic Parallax Transformations:
  // Starts with gentle presence (0.15) to maintain the clean Warm Ivory look at initial landing
  // Reveals rich depth as user scrolls down (up to 0.45 opacity), then softly dissolves into next section
  const imageOpacity = useTransform(smoothProgress, [0, 0.25, 0.65, 1], [0.18, 0.42, 0.35, 0.08]);
  
  // Cinematic camera push-in: scales gently from 1.0 -> 1.10
  const imageScale = useTransform(smoothProgress, [0, 1], [1.0, 1.10]);
  
  // Y-axis multi-plane translation: moves slower than text creating true parallax depth
  const imageTranslateY = useTransform(smoothProgress, [0, 1], ['0%', '15%']);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Cinematic Image Layer with Parallax Spring Physics */}
      <motion.div
        style={{
          opacity: imageOpacity,
          scale: imageScale,
          y: imageTranslateY,
          willChange: 'transform, opacity',
        }}
        className="absolute inset-0 w-full h-full flex items-center justify-center"
      >
        <img
          src={imageSrc}
          alt="UDYOGA MSME Financial Horizon"
          className="w-full h-full object-cover object-center filter saturate-[0.92] contrast-[1.04]"
        />
      </motion.div>

      {/* Brand Preservation & Typography Readability Shields */}
      {/* 1. Center Radial Mask: Keeps "Beyond credit. Beyond barriers." razor-sharp & legible */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-ivory/92 via-brand-ivory/65 to-transparent pointer-events-none" />

      {/* 2. Top & Bottom Seamless Edge Transitions into Navbar and Waveform Section */}
      <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-brand-ivory via-brand-ivory/85 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-brand-ivory via-brand-ivory/85 to-transparent pointer-events-none" />

      {/* 3. Deep Brand Atmospheric Blooms */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-forest/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/4 -right-24 w-[500px] h-[500px] bg-brand-terracotta/10 rounded-full blur-[140px] pointer-events-none" />
    </div>
  );
};
