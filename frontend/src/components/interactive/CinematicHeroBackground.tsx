import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface CinematicHeroBackgroundProps {
  videoSrc?: string;
  fallbackPoster?: string;
}

export const CinematicHeroBackground: React.FC<CinematicHeroBackgroundProps> = ({
  videoSrc = '/assets/video/msme_cinematic_story.mp4',
  fallbackPoster,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const [hasReducedMotion, setHasReducedMotion] = useState<boolean>(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setHasReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setHasReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Track scroll through the hero section (offset: start of hero to bottom of hero)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Smooth scroll progress to eliminate micro-jitter and create buttery Apple-style playback
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.2,
    restDelta: 0.0005,
  });

  // Background visual transformations:
  // Starts with soft opacity so the warm ivory initial state is completely preserved (0% opacity at top).
  // As user begins scrolling (0.05 -> 0.6), video opacity transitions smoothly to ~0.35 - 0.45.
  // Video gently scales from 1.0 to 1.08 giving camera push-in depth.
  const videoOpacity = useTransform(smoothProgress, [0, 0.1, 0.5, 0.9, 1], [0.03, 0.25, 0.42, 0.35, 0.1]);
  const videoScale = useTransform(smoothProgress, [0, 1], [1.0, 1.08]);
  const videoTranslateY = useTransform(smoothProgress, [0, 1], ['0%', '12%']);

  // Handle video metadata loaded to know duration
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || 10);
      setIsVideoLoaded(true);
    }
  };

  // Synchronize scroll progress directly to video.currentTime for forward/reverse scrubbing
  useEffect(() => {
    if (!videoRef.current || hasReducedMotion) return;

    let targetTime = 0;

    const unsubscribe = smoothProgress.on('change', (progressVal) => {
      if (videoDuration > 0 && videoRef.current) {
        // Clamp progress between 0 and 1
        const clampedProgress = Math.max(0, Math.min(1, progressVal));
        targetTime = clampedProgress * videoDuration;

        // Scrub video playback frame safely
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.03) {
          videoRef.current.currentTime = targetTime;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [smoothProgress, videoDuration, hasReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Cinematic Layer with Scroll Physics */}
      <motion.div
        style={{
          opacity: videoOpacity,
          scale: videoScale,
          y: videoTranslateY,
          willChange: 'transform, opacity',
        }}
        className="absolute inset-0 w-full h-full flex items-center justify-center"
      >
        {/* Cinematic Video Element */}
        <video
          ref={videoRef}
          src={videoSrc}
          poster={fallbackPoster}
          playsInline
          muted
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => setIsVideoLoaded(false)}
          className="w-full h-full object-cover object-center filter saturate-[0.85] contrast-[1.05]"
        />

        {/* Ambient Film Grain & Vignette Atmosphere if video isn't active or as fallback */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-forest/5 via-brand-terracotta/5 to-transparent" />
        )}
      </motion.div>

      {/* Warm Ivory & Forest Brand Tone Preserving Radial Overlays */}
      {/* 1. Center Readability Shield: Keeps the black & forest typography 100% legible */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-ivory/90 via-brand-ivory/60 to-transparent pointer-events-none" />

      {/* 2. Top & Bottom Seamless Edge Transitions into Navbar and Next Section */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-ivory via-brand-ivory/80 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-brand-ivory via-brand-ivory/80 to-transparent pointer-events-none" />

      {/* 3. Subtle Brand-Themed Corner Ambient Blooms for Depth */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-forest/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 -right-24 w-[480px] h-[480px] bg-brand-terracotta/10 rounded-full blur-[140px] pointer-events-none" />
    </div>
  );
};

