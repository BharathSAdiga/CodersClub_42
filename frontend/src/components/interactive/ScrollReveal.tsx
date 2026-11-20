import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  staggerChildren?: number;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance = 32,
  className = '',
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-60px 0px' });

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance };
      case 'down':
        return { opacity: 0, y: -distance };
      case 'left':
        return { opacity: 0, x: distance };
      case 'right':
        return { opacity: 0, x: -distance };
      case 'none':
      default:
        return { opacity: 0, scale: 0.98 };
    }
  };

  const getAnimatePosition = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { opacity: 1, y: 0 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
      case 'none':
      default:
        return { opacity: 1, scale: 1 };
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
        ease: [0.21, 0.47, 0.32, 0.98], // Spring-like natural decel curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const TextRevealByLine: React.FC<{
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}> = ({ text, className = '', delay = 0, as = 'h1' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px 0px' });
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 120,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 120,
      },
    },
  };

  const Component = as as any;

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className="inline-block overflow-hidden"
    >
      <Component className={className}>
        {words.map((word, index) => (
          <motion.span
            variants={child}
            key={index}
            className="inline-block mr-[0.25em] last:mr-0"
          >
            {word}
          </motion.span>
        ))}
      </Component>
    </motion.div>
  );
};
