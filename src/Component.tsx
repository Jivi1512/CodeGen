import React, { useEffect, useRef, useState } from 'react';

// Elegant zero-dependency classname merger
function cn(...classes: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  const result: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (typeof c === 'string') {
      result.push(c);
    } else if (typeof c === 'object') {
      for (const key in c) {
        if (c[key]) result.push(key);
      }
    }
  }
  return result.join(' ');
}

export interface GlowingEdgeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'dark' | 'light';
  children?: React.ReactNode;
  className?: string;
  onStatsUpdate?: (stats: { x: string; y: string; deg: string; intensity: string }) => void;
}

/**
 * GlowingEdgeCard
 * 
 * A distinctive card component with colored, glowing edges that follow the mouse pointer.
 * It uses complex CSS gradients and masks to create a mesh gradient border and background effect.
 */
export function GlowingEdgeCard({ 
  mode = 'dark', 
  className, 
  children,
  onStatsUpdate,
  ...props 
}: GlowingEdgeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper functions for math
  const round = (value: number, precision = 1) => parseFloat(value.toFixed(precision));
  const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

  const centerOfElement = (rect: DOMRect) => {
    return [rect.width / 2, rect.height / 2];
  };

  const getPointerPosition = (rect: DOMRect, e: MouseEvent | React.MouseEvent) => {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = clamp((100 / rect.width) * x);
    const py = clamp((100 / rect.height) * y);
    return { pixels: [x, y], percent: [px, py] };
  };

  const angleFromPointer = (dx: number, dy: number) => {
    let angleRadians = 0;
    let angleDegrees = 0;
    if (dx !== 0 || dy !== 0) {
      angleRadians = Math.atan2(dy, dx);
      angleDegrees = angleRadians * (180 / Math.PI) + 90;
      if (angleDegrees < 0) {
        angleDegrees += 360;
      }
    }
    return angleDegrees;
  };

  const closenessToEdge = (rect: DOMRect, x: number, y: number) => {
    const [cx, cy] = centerOfElement(rect);
    const dx = x - cx;
    const dy = y - cy;
    let k_x = Infinity;
    let k_y = Infinity;
    if (dx !== 0) {
      k_x = cx / Math.abs(dx);
    }
    if (dy !== 0) {
      k_y = cy / Math.abs(dy);
    }
    return clamp((1 / Math.min(k_x, k_y)), 0, 1);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const position = getPointerPosition(rect, e);
    const [px, py] = position.pixels;
    const [perx, pery] = position.percent;
    
    const [cx, cy] = centerOfElement(rect);
    const dx = px - cx;
    const dy = py - cy;
    
    const edge = closenessToEdge(rect, px, py);
    const angle = angleFromPointer(dx, dy);

    const roundedX = `${round(perx)}%`;
    const roundedY = `${round(pery)}%`;
    const roundedDeg = `${round(angle)}deg`;
    const roundedIntensity = `${round(edge * 100)}%`;

    cardRef.current.style.setProperty('--pointer-x', roundedX);
    cardRef.current.style.setProperty('--pointer-y', roundedY);
    cardRef.current.style.setProperty('--pointer-deg', roundedDeg);
    cardRef.current.style.setProperty('--pointer-d', `${round(edge * 100)}`);
    
    if (onStatsUpdate) {
      onStatsUpdate({
        x: roundedX,
        y: roundedY,
        deg: `${round(angle)}°`,
        intensity: roundedIntensity
      });
    }

    // Stop intro animation interaction
    if (isAnimating) {
        setIsAnimating(false);
        cardRef.current.classList.remove('animating');
    }
  };

  const handlePointerLeave = () => {
    if (onStatsUpdate) {
      onStatsUpdate({
        x: '50%',
        y: '50%',
        deg: '0°',
        intensity: '0%'
      });
    }
  };

  // Intro animation
  useEffect(() => {
    const playAnimation = () => {
      if (!cardRef.current) return;
      
      setIsAnimating(true);
      const angleStart = 110;
      const angleEnd = 465;
      
      cardRef.current.style.setProperty('--pointer-deg', `${angleStart}deg`);
      
      const startTime = performance.now();
      
      const animate = (now: number) => {
        if (!cardRef.current || !cardRef.current.classList.contains('animating')) return;
        
        const elapsed = now - startTime;
        
        // Distance increase (fade in glow)
        if (elapsed > 500 && elapsed < 1000) {
            const t = (elapsed - 500) / 500;
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
            cardRef.current.style.setProperty('--pointer-d', `${ease * 100}`);
        }
        
        // Rotation part 1
        if (elapsed > 500 && elapsed < 2000) {
            const t = (elapsed - 500) / 1500;
            const ease = t * t * t; // easeInCubic
            const d = (angleEnd - angleStart) * (ease * 0.5) + angleStart;
            cardRef.current.style.setProperty('--pointer-deg', `${d}deg`);
        }
        
        // Rotation part 2
        if (elapsed >= 2000 && elapsed < 4250) {
            const t = (elapsed - 2000) / 2250;
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
            const d = (angleEnd - angleStart) * (0.5 + ease * 0.5) + angleStart;
            cardRef.current.style.setProperty('--pointer-deg', `${d}deg`);
        }
        
        // Distance decrease (fade out glow)
        if (elapsed > 3000 && elapsed < 4500) {
            const t = (elapsed - 3000) / 1500;
            const ease = t * t * t; // easeInCubic
            cardRef.current.style.setProperty('--pointer-d', `${(1 - ease) * 100}`);
        }
        
        if (elapsed < 4500) {
            requestAnimationFrame(animate);
        } else {
            setIsAnimating(false);
            cardRef.current?.classList.remove('animating');
        }
      };
      
      requestAnimationFrame(animate);
    };

    const timer = setTimeout(() => {
        playAnimation();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={cn(
        "relative w-full max-w-[600px] h-[600px] max-h-[80vh]",
        "flex flex-col rounded-[1.768em]",
        "group transition-colors duration-300",
        mode === 'light' ? 'light-mode' : 'dark-mode',
        isAnimating && 'animating',
        className
      )}
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        '--glow-sens': '30',
        '--pointer-x': '50%',
        '--pointer-y': '50%',
        '--pointer-deg': '45deg', 
        '--pointer-d': '0',
        
        '--color-sens': 'calc(var(--glow-sens) + 20)',
        
        '--card-bg': mode === 'light' 
           ? 'linear-gradient(8deg, color-mix(in hsl, hsl(260, 15%, 97%), #000 1.5%) 75%, hsl(260, 15%, 97%) 75.5%)'
           : 'linear-gradient(8deg, #121316 75%, color-mix(in hsl, #121316, white 1.5%) 75.5%)',
        '--blend': mode === 'light' ? 'darken' : 'soft-light',
        '--glow-blend': mode === 'light' ? 'luminosity' : 'plus-lighter',
        '--glow-color': mode === 'light' ? '280deg 80% 90%' : '40deg 85% 85%',
        '--glow-boost': mode === 'light' ? '10%' : '0%',
        '--fg': mode === 'light' ? 'black' : 'white',
      } as React.CSSProperties}
      {...props}
    >
        <style dangerouslySetInnerHTML={{__html: `
            .glowing-card-mesh-border {
                position: absolute;
                inset: 0;
                border-radius: inherit;
                z-index: -1;
                border: 1px solid transparent;
                background:
                    linear-gradient(var(--card-bg) 0 100%) padding-box,
                    linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box,
                    radial-gradient(at 80% 55%, hsla(268,100%,76%,1) 0px, transparent 50%) border-box,
                    radial-gradient(at 69% 34%, hsla(349,100%,74%,1) 0px, transparent 50%) border-box,
                    radial-gradient(at 8% 6%, hsla(136,100%,78%,1) 0px, transparent 50%) border-box,
                    radial-gradient(at 41% 38%, hsla(192,100%,64%,1) 0px, transparent 50%) border-box,
                    radial-gradient(at 86% 85%, hsla(186,100%,74%,1) 0px, transparent 50%) border-box,
                    radial-gradient(at 82% 18%, hsla(52,100%,65%,1) 0px, transparent 50%) border-box,
                    radial-gradient(at 51% 4%, hsla(12,100%,72%,1) 0px, transparent 50%) border-box,
                    linear-gradient(#c299ff 0 100%) border-box;
                opacity: calc((var(--pointer-d) - var(--color-sens)) / (100 - var(--color-sens)));
                mask-image: conic-gradient(from var(--pointer-deg) at center, black 25%, transparent 40%, transparent 60%, black 75%);
                transition: opacity 0.25s ease-out;
            }
            
            .glowing-card-mesh-bg {
                position: absolute;
                inset: 0;
                border-radius: inherit;
                z-index: -1;
                border: 1px solid transparent;
                background:
                    radial-gradient(at 80% 55%, hsla(268,100%,76%,1) 0px, transparent 50%) padding-box,
                    radial-gradient(at 69% 34%, hsla(349,100%,74%,1) 0px, transparent 50%) padding-box,
                    radial-gradient(at 8% 6%, hsla(136,100%,78%,1) 0px, transparent 50%) padding-box,
                    radial-gradient(at 41% 38%, hsla(192,100%,64%,1) 0px, transparent 50%) padding-box,
                    radial-gradient(at 86% 85%, hsla(186,100%,74%,1) 0px, transparent 50%) padding-box,
                    radial-gradient(at 82% 18%, hsla(52,100%,65%,1) 0px, transparent 50%) padding-box,
                    radial-gradient(at 51% 4%, hsla(12,100%,72%,1) 0px, transparent 50%) padding-box,
                    linear-gradient(#c299ff 0 100%) padding-box;
                mask-image:
                    linear-gradient(to bottom, black, black),
                    radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%),
                    radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%),
                    radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%),
                    radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%),
                    radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%),
                    conic-gradient(from var(--pointer-deg) at center, transparent 5%, black 15%, black 85%, transparent 95%);
                mask-composite: subtract, add, add, add, add, add, add;
                opacity: calc((var(--pointer-d) - var(--color-sens)) / (100 - var(--color-sens)));
                mix-blend-mode: var(--blend);
                transition: opacity 0.25s ease-out;
            }
            
            .glowing-card-glow {
                position: absolute;
                inset: -40px;
                pointer-events: none;
                z-index: 1;
                mask-image: conic-gradient(from var(--pointer-deg) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%);
                opacity: calc((var(--pointer-d) - var(--glow-sens)) / (100 - var(--glow-sens)));
                mix-blend-mode: var(--glow-blend);
                transition: opacity 0.25s ease-out;
                border-radius: inherit;
            }
            
            .glowing-card-glow::before {
                content: "";
                position: absolute;
                inset: 40px;
                border-radius: inherit;
                box-shadow: 
                    inset 0 0 0 1px hsl(var(--glow-color) / 100%),
                    inset 0 0 1px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 60%)),
                    inset 0 0 3px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 50%)),
                    inset 0 0 6px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 40%)),
                    inset 0 0 15px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 30%)),
                    inset 0 0 25px 2px hsl(var(--glow-color) / calc(var(--glow-boost) + 20%)),
                    inset 0 0 50px 2px hsl(var(--glow-color) / calc(var(--glow-boost) + 10%)),
                    0 0 1px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 60%)),
                    0 0 3px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 50%)),
                    0 0 6px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 40%)),
                    0 0 15px 0 hsl(var(--glow-color) / calc(var(--glow-boost) + 30%)),
                    0 0 25px 2px hsl(var(--glow-color) / calc(var(--glow-boost) + 20%)),
                    0 0 50px 2px hsl(var(--glow-color) / calc(var(--glow-boost) + 10%));
            }

            .group:not(:hover):not(.animating) .glowing-card-mesh-border,
            .group:not(:hover):not(.animating) .glowing-card-mesh-bg,
            .group:not(:hover):not(.animating) .glowing-card-glow {
                opacity: 0 !important;
                transition: opacity 0.75s ease-in-out;
            }
        `}} />
        
        {/* Background Layers */}
        <div className="glowing-card-mesh-border" />
        <div className="glowing-card-mesh-bg" />
        <div className="glowing-card-glow" />
        
        {/* Content Container */}
        <div className="relative z-10 w-full h-full overflow-hidden bg-[var(--card-bg)] bg-no-repeat rounded-[inherit] border border-white/10">
             {children}
        </div>
    </div>
  );
}

export default GlowingEdgeCard;
