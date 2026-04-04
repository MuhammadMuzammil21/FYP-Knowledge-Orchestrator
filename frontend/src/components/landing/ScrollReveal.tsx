'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type AnimationVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade'
  | 'scale'
  | 'blur';

interface ScrollRevealProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const baseStyles: React.CSSProperties = {
    transitionProperty: 'opacity, transform, filter',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}ms`,
  };

  const hiddenStyles: Record<AnimationVariant, React.CSSProperties> = {
    'fade-up': { opacity: 0, transform: 'translateY(30px)' },
    'fade-down': { opacity: 0, transform: 'translateY(-30px)' },
    'fade-left': { opacity: 0, transform: 'translateX(30px)' },
    'fade-right': { opacity: 0, transform: 'translateX(-30px)' },
    fade: { opacity: 0 },
    scale: { opacity: 0, transform: 'scale(0.95)' },
    blur: { opacity: 0, filter: 'blur(8px)' },
  };

  const visibleStyles: React.CSSProperties = {
    opacity: 1,
    transform: 'none',
    filter: 'none',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...baseStyles,
        ...(isVisible ? visibleStyles : hiddenStyles[variant]),
      }}
    >
      {children}
    </div>
  );
}

/** Stagger container — wraps children with incremental delays */
export function StaggerChildren({
  children,
  variant = 'fade-up',
  stagger = 100,
  baseDelay = 0,
  duration = 600,
  className = '',
}: {
  children: ReactNode[];
  variant?: AnimationVariant;
  stagger?: number;
  baseDelay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {(Array.isArray(children) ? children : [children]).map((child, i) => (
        <ScrollReveal key={i} variant={variant} delay={baseDelay + i * stagger} duration={duration}>
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
