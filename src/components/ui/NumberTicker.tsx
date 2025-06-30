'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { formatYear } from '@/lib/utils';

interface NumberTickerProps {
  value: number;
  startValue?: number;
  duration?: number;
  className?: string;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  startValue,
  duration = 400,
  className = '',
}) => {
  const motionValue = useMotionValue(startValue ?? value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (startValue !== undefined && startValue !== value) {
      console.log(`NumberTicker animating from ${startValue} to ${value}`);
      const controls = animate(motionValue, value, {
        duration: duration / 1000,
        ease: 'easeOut',
      });

      return () => controls.stop();
    } else {
      console.log(`NumberTicker setting immediately to ${value}`);
      // Set immediately if no animation needed
      motionValue.set(value);
    }
  }, [value, startValue, duration, motionValue]);

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = formatYear(Math.round(latest));
      }
    });

    return unsubscribe;
  }, [motionValue]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 1 }}
    >
      {formatYear(value)}
    </motion.span>
  );
};