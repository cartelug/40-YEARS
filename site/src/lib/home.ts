/**
 * Home boot — one module, one rAF world.
 * Everything is progressive enhancement over a fully-readable static page:
 * no JS (or reduced motion) → drawn spine, final numbers, stacked journey,
 * native-scroll filmstrip.
 */
import { ensureMotion, initReveals, prefersReducedMotion, scrollToTarget } from './motion';

function initSmoothAnchors(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
      history.pushState(null, '', id);
    });
  });
}

/* ————— The transformation spine ————— */
function initSpine(): void {
  const spine = document.getElementById('spine');
  const progress = document.getElementById('spine-progress');
  const nodesWrap = document.getElementById('spine-nodes');
  if (!spine || !progress || !nodesWrap) return;

  const chapters = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'));
  const nodes = chapters.map((ch, i) => {
    const node = document.createElement('div');
    node.className = 'spine-node';
    if (i === chapters.length - 1) {
      const label = document.createElement('span');
      label.className = 'stamp spine-node-label tnum';
      label.textContent = '2026';
      node.appendChild(label);
    }
    nodesWrap.appendChild(node);
    return node;
  });

  const layout = () => {
    const spineTop = spine.getBoundingClientRect().top + window.scrollY;
    chapters.forEach((ch, i) => {
      const chTop = ch.getBoundingClientRect().top + window.scrollY;
      const y = Math.max(0, chTop + (i === 0 ? 0 : 120) - spineTop);
      nodes[i].style.top = `${y}px`;
    });
  };
  layout();
  window.addEventListener('resize', layout, { passive: true });
  // late layout shift guard (fonts/images settling)
  setTimeout(layout, 600);
  window.addEventListener('load', layout);

  if (prefersReducedMotion()) return; // stays fully drawn

  const { gsap, ScrollTrigger } = ensureMotion();
  gsap.fromTo(
    progress,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: spine, start: 'top center', end: 'bottom center', scrub: true },
    },
  );
  chapters.forEach((ch, i) => {
    ScrollTrigger.create({
      trigger: ch,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => nodes[i].classList.toggle('is-active', self.isActive),
    });
  });
}

/* ————— Scroll-spy chapter rail ————— */
function initNavSpy(): void {
  const links = new Map(
    Array.from(document.querySelectorAll<HTMLAnchorElement>('#chapter-nav a[data-spy]')).map((a) => [
      a.dataset.spy!,
      a,
    ]),
  );
  if (!links.size) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          links.forEach((a) => a.classList.remove('is-active'));
          links.get(e.target.id)?.classList.add('is-active');
        }
      }
    },
    { rootMargin: '-42% 0px -42% 0px' },
  );
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) io.observe(section);
  });
}

/* ————— Ledger count-up (once, tabular; SSR already shows final values) ————— */
function initCountUp(): void {
  if (prefersReducedMotion()) return;
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!els.length) return;
  const { gsap } = ensureMotion();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const el = e.target as HTMLElement;
        const to = parseFloat(el.dataset.count || '0');
        const from = parseFloat(el.dataset.countFrom || '0');
        const prefix = el.dataset.countPrefix || '';
        const suffix = el.dataset.countSuffix || '';
        const state = { v: from };
        gsap.to(state, {
          v: to,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate() {
            el.textContent = `${prefix}${Math.round(state.v).toLocaleString('en-US')}${suffix}`;
          },
          onComplete() {
            el.textContent = `${prefix}${to.toLocaleString('en-US')}${suffix}`;
          },
        });
      }
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
}

/* ————— The Journey: vertical scroll drives era progression (pinned, scrubbed) ————— */
function initJourney(): void {
  const pin = document.getElementById('journey-pin');
  if (!pin) return;
  const { gsap } = ensureMotion();
  const mm = gsap.matchMedia();

  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const panels = gsap.utils.toArray<HTMLElement>('.journey-panel');
    const imgs = gsap.utils.toArray<HTMLElement>('.journey-img');
    const ticks = gsap.utils.toArray<HTMLElement>('.journey-tick');
    const progress = document.getElementById('journey-progress');
    const n = panels.length;
    if (n < 2) return;

    gsap.set(panels.slice(1), { autoAlpha: 0 });
    gsap.set(panels[0], { autoAlpha: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: `+=${n * 85}%`,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate(self) {
          const idx = Math.min(n - 1, Math.floor(self.progress * n));
          ticks.forEach((t, i) => t.classList.toggle('is-passed', i <= idx));
        },
      },
    });

    for (let i = 1; i < n; i++) {
      const at = i;
      tl.to(panels[i - 1], { autoAlpha: 0, x: -48, duration: 0.4 }, at);
      tl.fromTo(panels[i], { autoAlpha: 0, x: 64 }, { autoAlpha: 1, x: 0, duration: 0.5 }, at + 0.15);
      tl.to(imgs[i - 1], { autoAlpha: 0, duration: 0.5 }, at);
      tl.fromTo(imgs[i], { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.6 }, at + 0.05);
    }
    if (progress) {
      tl.fromTo(progress, { scaleX: 1 / n }, { scaleX: 1, duration: n - 1, ease: 'none' }, 1);
      gsap.set(progress, { scaleX: 1 / n });
    }
    return () => {
      ticks.forEach((t) => t.classList.remove('is-passed'));
    };
  });
}

/* ————— Filmstrip: native scroll + drag inertia + keys + ticking counter ————— */
function initFilmstrip(): void {
  const strip = document.getElementById('filmstrip');
  const counter = document.getElementById('film-counter');
  if (!strip) return;
  const frames = Array.from(strip.querySelectorAll<HTMLElement>('.film-frame'));
  const reduced = prefersReducedMotion();

  let activeIdx = -1;
  const setActive = () => {
    const center = strip.scrollLeft + strip.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    frames.forEach((f, i) => {
      const c = f.offsetLeft + f.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    if (best !== activeIdx) {
      activeIdx = best;
      frames.forEach((f, i) => f.classList.toggle('is-active', i === best));
      if (counter) counter.textContent = String(best + 1).padStart(3, '0');
    }
  };
  let raf = 0;
  strip.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(setActive);
    },
    { passive: true },
  );
  setActive();

  const goTo = (i: number) => {
    const f = frames[Math.max(0, Math.min(frames.length - 1, i))];
    if (!f) return;
    strip.scrollTo({
      left: f.offsetLeft + f.offsetWidth / 2 - strip.clientWidth / 2,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  strip.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(activeIdx + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(activeIdx - 1);
    }
  });
  document.getElementById('film-prev')?.addEventListener('click', () => goTo(activeIdx - 1));
  document.getElementById('film-next')?.addEventListener('click', () => goTo(activeIdx + 1));

  // drag with inertia (pointer only; native touch scrolling is left alone)
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let lastX = 0;
  let velocity = 0;
  strip.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    dragging = true;
    startX = lastX = e.clientX;
    startScroll = strip.scrollLeft;
    velocity = 0;
    strip.classList.add('is-dragging');
    strip.setPointerCapture(e.pointerId);
  });
  strip.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    velocity = e.clientX - lastX;
    lastX = e.clientX;
    strip.scrollLeft = startScroll - (e.clientX - startX);
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    let v = -velocity;
    const coast = () => {
      if (Math.abs(v) < 0.6) {
        strip.classList.remove('is-dragging');
        return;
      }
      strip.scrollLeft += v;
      v *= 0.94;
      requestAnimationFrame(coast);
    };
    if (!reduced) coast();
    else strip.classList.remove('is-dragging');
  };
  strip.addEventListener('pointerup', endDrag);
  strip.addEventListener('pointercancel', endDrag);
}

/* ————— Seal + hero parallax ————— */
function initSeal(): void {
  const seal = document.querySelector('[data-seal]');
  if (!seal) return;
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        seal.classList.add('is-inview');
        io.disconnect();
      }
    },
    { threshold: 0.35 },
  );
  io.observe(seal);
}

function initParallax(): void {
  const { gsap } = ensureMotion();
  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const heroImg = document.querySelector('#opening picture img');
    if (heroImg) {
      gsap.to(heroImg, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: '#opening', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  });
}

const { ScrollTrigger } = ensureMotion();
// re-measure pin/scrub positions once late layout (fonts, plates) settles
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
initReveals();
initSmoothAnchors();
initSpine();
initNavSpy();
initCountUp();
initJourney();
initFilmstrip();
initSeal();
initParallax();
