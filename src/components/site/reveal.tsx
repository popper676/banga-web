"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

/**
 * Scroll reveal. Content is always in the DOM and readable — this only
 * animates opacity/translate, and the CSS disables it entirely under
 * prefers-reduced-motion or the in-app reduced-motion toggle.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <As
      ref={ref as never}
      data-visible={visible}
      data-delay={delay || undefined}
      className={cn("reveal", className)}
    >
      {children}
    </As>
  );
}

/**
 * 2.5D parallax layer driven by pointer position and scroll.
 * Pure CSS transforms — no 3D library, no paid assets, and it pauses
 * entirely when the section leaves the viewport.
 */
export function ParallaxScene({
  children,
  className,
  strength = 1,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.dataset.reducedMotion === "true") return;

    let active = false;
    let raf = 0;
    let px = 0;
    let py = 0;
    let sy = 0;

    const apply = () => {
      raf = 0;
      const layers = node.querySelectorAll<HTMLElement>("[data-depth]");
      layers.forEach((el) => {
        const depth = Number(el.dataset.depth ?? 1) * strength;
        el.style.transform = `translate3d(${px * 14 * depth}px, ${py * 12 * depth + sy * 18 * depth}px, 0) rotateX(${-py * 4 * depth}deg) rotateY(${px * 5 * depth}deg)`;
      });
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onPointer = (e: PointerEvent) => {
      if (!active) return;
      const r = node.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      schedule();
    };

    const onScroll = () => {
      if (!active) return;
      const r = node.getBoundingClientRect();
      sy = Math.max(-1, Math.min(1, -r.top / window.innerHeight));
      schedule();
    };

    const io = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (!active && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(node);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn("scene-25d", className)}>
      {children}
    </div>
  );
}
