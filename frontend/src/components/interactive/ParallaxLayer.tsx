import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxWrapperProps {
  children?: React.ReactNode;
  speed?: number; // e.g. -50 to 50
  className?: string;
  rotate?: number;
}

export const ParallaxLayer: React.FC<ParallaxWrapperProps> = ({
  children,
  speed = 40,
  className = '',
  rotate = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Apply smooth physics transform without layout thrashing
  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);
  const rotateVal = useTransform(scrollYProgress, [0, 1], [-rotate, rotate]);

  return (
    <motion.div
      ref={ref}
      style={{ 
        y, 
        rotate: rotate !== 0 ? rotateVal : undefined,
        willChange: 'transform'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
