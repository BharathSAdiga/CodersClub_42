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
<<<<<<< HEAD
  scale?: number;
=======
>>>>>>> origin/feature/harshitha-finance
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
<<<<<<< HEAD
  duration = 0.75,
  distance = 36,
  className = '',
  once = true,
  scale = 1,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-50px 0px' });

  const getInitialPosition = () => {
    const baseScale = scale < 1 ? scale : 0.985;
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance, scale: baseScale };
      case 'down':
        return { opacity: 0, y: -distance, scale: baseScale };
      case 'left':
        return { opacity: 0, x: distance, scale: baseScale };
      case 'right':
        return { opacity: 0, x: -distance, scale: baseScale };
      case 'none':
      default:
        return { opacity: 0, scale: baseScale };
=======
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
>>>>>>> origin/feature/harshitha-finance
    }
  };

  const getAnimatePosition = () => {
    switch (direction) {
      case 'up':
      case 'down':
<<<<<<< HEAD
        return { opacity: 1, y: 0, scale: 1 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0, scale: 1 };
=======
        return { opacity: 1, y: 0 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
>>>>>>> origin/feature/harshitha-finance
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
<<<<<<< HEAD
        ease: [0.16, 1, 0.3, 1], // Apple-style fluid spring decel curve
=======
        ease: [0.21, 0.47, 0.32, 0.98], // Spring-like natural decel curve
>>>>>>> origin/feature/harshitha-finance
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
<<<<<<< HEAD
      transition: { staggerChildren: 0.045, delayChildren: delay * i },
=======
      transition: { staggerChildren: 0.04, delayChildren: delay * i },
>>>>>>> origin/feature/harshitha-finance
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
<<<<<<< HEAD
        damping: 18,
        stiffness: 140,
=======
        damping: 15,
        stiffness: 120,
>>>>>>> origin/feature/harshitha-finance
      },
    },
    hidden: {
      opacity: 0,
<<<<<<< HEAD
      y: 22,
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 140,
=======
      y: 20,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 120,
>>>>>>> origin/feature/harshitha-finance
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
