/**
 * Shared motion runtime — one Lenis instance, one GSAP/ScrollTrigger
 * registration, one rAF loop for the whole page. Every island imports
 * from here so the site never runs two smooth-scroll loops.
 *
 * Motion grammar (tokens in global.css):
 *  - entrances: fade-up 24px, ease-entrance, once
 *  - scrubbed effects: linear, driven by ScrollTrigger scrub
 *  - reduced motion: everything static, final values only
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

let booted = false;
let lenis: Lenis | null = null;

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isMobile = (): boolean =>
  window.matchMedia('(max-width: 767px)').matches;

export function ensureMotion(): { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger; lenis: Lenis | null } {
  if (booted) return { gsap, ScrollTrigger, lenis };
  booted = true;

  gsap.registerPlugin(ScrollTrigger);
  // exposed for the screenshot/QA tooling (scripts/probe-*.mjs)
  (window as unknown as { __ST?: typeof ScrollTrigger }).__ST = ScrollTrigger;

  if (!prefersReducedMotion()) {
    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false, // never fight native touch scrolling
    });
    // Single rAF: Lenis drives ScrollTrigger, GSAP's ticker drives Lenis.
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis?.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  return { gsap, ScrollTrigger, lenis };
}

export function scrollToTarget(target: string | HTMLElement, offset = 0): void {
  if (lenis && !prefersReducedMotion()) {
    lenis.scrollTo(target, { offset, duration: 1.1 });
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

/**
 * Wire [data-reveal] / [data-reveal-stagger] elements site-wide.
 * CSS owns the transition; JS only toggles .is-inview once.
 * Under reduced motion the CSS rules never hide anything.
 */
export function initReveals(): void {
  if (prefersReducedMotion()) return;
  const els = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-inview');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );
  els.forEach((el) => io.observe(el));
}
