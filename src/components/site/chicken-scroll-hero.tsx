"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./chicken-scroll-hero.module.css";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function ChickenScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const updateScrollEffects = () => {
      frame = 0;
      const available = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = reducedMotion.matches
        ? 0
        : clamp(-section.getBoundingClientRect().top / available, 0, 1);

      section.style.setProperty("--hero-progress", progress.toFixed(4));
      section.dataset.phase = progress < 0.34 ? "drop" : progress < 0.72 ? "stack" : "serve";

      // Scroll drives only the surrounding UI. The food film keeps playing independently.
      if (!reducedMotion.matches && video.paused) void video.play().catch(() => undefined);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrollEffects);
    };

    const keepPlaying = () => {
      if (!document.hidden && !reducedMotion.matches) void video.play().catch(() => undefined);
    };

    video.addEventListener("loadeddata", keepPlaying);
    reducedMotion.addEventListener("change", requestUpdate);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    document.addEventListener("visibilitychange", keepPlaying);
    requestUpdate();
    keepPlaying();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      video.removeEventListener("loadeddata", keepPlaying);
      reducedMotion.removeEventListener("change", requestUpdate);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      document.removeEventListener("visibilitychange", keepPlaying);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.scrollScene}
      aria-labelledby="hero-title"
      data-phase="drop"
    >
      <div className={styles.stickyFrame}>
        <video
          ref={videoRef}
          className={styles.chickenVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/media/chicken-fall-start.webp"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/media/chicken-fall.mp4" type="video/mp4" />
        </video>

        <div className={styles.videoShade} aria-hidden="true" />
        <div className={styles.checkerTop} aria-hidden="true" />
        <div className={styles.checkerBottom} aria-hidden="true" />
        <span className={styles.ghostWord} aria-hidden="true">CRUNCH</span>

        <div className={styles.content}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>
              <span>방가방가</span>
              Korean comfort, made playful
            </p>
            <h1 id="hero-title" className={styles.title}>
              LET IT
              <br />
              <span>FALL.</span>
            </h1>
            <p className={styles.lead}>
              Crispy boneless chicken. Big Korean flavour. Scroll to build the plate,
              then pick your favourite sauce.
            </p>

            <div className={styles.actions}>
              <Link href="/menu" className={styles.primaryAction}>
                Order chicken
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/menu" className={styles.secondaryAction}>
                Explore the menu
              </Link>
            </div>

            <ul className={styles.proof} aria-label="Restaurant highlights">
              <li>Boneless</li>
              <li>Muslim-friendly</li>
              <li>Sets under RM20</li>
            </ul>
          </div>

          <div className={styles.flavourTag} aria-hidden="true">
            <span>01</span>
            <strong>SOY<br />GARLIC</strong>
          </div>

          <div className={styles.scrollGuide} aria-hidden="true">
            <span className={styles.scrollLabel}>SCROLL TO EXPLORE</span>
            <span className={styles.track}><span className={styles.fill} /></span>
            <span className={styles.step} data-step="drop">DROP</span>
            <span className={styles.step} data-step="stack">STACK</span>
            <span className={styles.step} data-step="serve">SERVE</span>
          </div>
        </div>

        <p className="sr-only">
          A looping film shows Korean boneless chicken falling onto a serving plate while the page
          typography and decorative elements respond to scrolling.
        </p>
      </div>
    </section>
  );
}
