import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { clsx } from 'clsx';

// Common animation variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const rotateVariants: Variants = {
  hidden: { opacity: 0, rotate: -180 },
  visible: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 180 },
};

// Stagger animation for lists
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Animated components
export interface AnimatedProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  initial?: string;
  animate?: string;
  exit?: string;
  transition?: any;
  delay?: number;
  duration?: number;
}

export const Animated: React.FC<AnimatedProps> = ({
  children,
  className,
  variants = fadeInVariants,
  initial = 'hidden',
  animate = 'visible',
  exit = 'exit',
  transition,
  delay = 0,
  duration = 0.3,
}) => {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={{
        duration,
        delay,
        ...transition,
      }}
    >
      {children}
    </motion.div>
  );
};

export const FadeIn: React.FC<AnimatedProps> = (props) => (
  <Animated variants={fadeInVariants} {...props} />
);

export const SlideUp: React.FC<AnimatedProps> = (props) => (
  <Animated variants={slideUpVariants} {...props} />
);

export const SlideDown: React.FC<AnimatedProps> = (props) => (
  <Animated variants={slideDownVariants} {...props} />
);

export const SlideLeft: React.FC<AnimatedProps> = (props) => (
  <Animated variants={slideLeftVariants} {...props} />
);

export const SlideRight: React.FC<AnimatedProps> = (props) => (
  <Animated variants={slideRightVariants} {...props} />
);

export const Scale: React.FC<AnimatedProps> = (props) => (
  <Animated variants={scaleVariants} {...props} />
);

export const Rotate: React.FC<AnimatedProps> = (props) => (
  <Animated variants={rotateVariants} {...props} />
);

// Animated list component
export interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className,
  staggerDelay = 0.1,
}) => {
  return (
    <motion.div
      className={className}
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: staggerDelay }}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedListItem: React.FC<AnimatedProps> = (props) => (
  <Animated variants={staggerItemVariants} {...props} />
);

// Animated presence wrapper
export interface AnimatedPresenceProps {
  children: React.ReactNode;
  className?: string;
  mode?: 'wait' | 'sync' | 'popLayout';
}

export const AnimatedPresenceWrapper: React.FC<AnimatedPresenceProps> = ({
  children,
  className,
  mode = 'wait',
}) => {
  return (
    <AnimatePresence mode={mode}>
      <div className={className}>{children}</div>
    </AnimatePresence>
  );
};

// Hover animations
export interface HoverAnimatedProps extends AnimatedProps {
  hoverScale?: number;
  hoverRotate?: number;
  hoverY?: number;
  hoverX?: number;
}

export const HoverAnimated: React.FC<HoverAnimatedProps> = ({
  children,
  className,
  hoverScale = 1.05,
  hoverRotate = 0,
  hoverY = 0,
  hoverX = 0,
  ...props
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: hoverScale,
        rotate: hoverRotate,
        y: hoverY,
        x: hoverX,
      }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Loading animations
export const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    className={clsx('inline-block', className)}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  >
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </motion.div>
);

export const Pulse: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    className={className}
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 2, repeat: Infinity }}
  />
);

export const Bounce: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 1, repeat: Infinity }}
  />
); 