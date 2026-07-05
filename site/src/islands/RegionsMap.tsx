/**
 * The Regions — geography as interface.
 * Accurate national outline; four keyboard-selectable regional nodes;
 * thin gold lines draw from the regional node to its districts on select.
 */
import { useEffect, useRef, useState } from 'react';

type Region = {
  id: string;
  name: string;
  districts: string;
  node: [number, number];
  stats: { value: string; label: string }[];
  stories: string[];
  signals: string[];
  cities: string[];
};

type MapData = {
  viewBox: string;
  width: number;
  height: number;
  path: string;
  cities: Record<string, [number, number]>;
};

const SIGNAL_LABELS: Record<string, string> = {
  roads: 'Roads',
  industry: 'Industry',
  water: 'Water',
  agriculture: 'Agriculture',
  power: 'Power',
  solar: 'Solar',
  recovery: 'Recovery',
  refuge: 'Refugee hosting',
  schools: 'Schools',
  oil: 'Oil',
  enterprise: 'Enterprise',
};

type RegionPhoto = {
  src: string;
  srcset: string;
  width: number;
  height: number;
  lqip: string;
  alt: string;
  caption: string;
};

export default function RegionsMap({
  regions,
  map,
  photos = {},
}: {
  regions: Region[];
  map: MapData;
  photos?: Record<string, RegionPhoto>;
}) {
  const [active, setActive] = useState(regions[0].id);
  const [drawn, setDrawn] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const region = regions.find((r) => r.id === active)!;
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div ref={rootRef} class="grid grid-cols-12 gap-x-6 gap-y-10">
      <div class="col-span-12 lg:col-span-7">
        <div class="relative mx-auto max-w-[560px]">
          <svg viewBox={map.viewBox} class="w-full" role="img" aria-label="Map of Uganda with its four regions">
            <path d={map.path} fill="#121620" stroke="#C9A227" stroke-width="2" vector-effect="non-scaling-stroke" opacity={drawn ? 1 : 0} style={{ transition: 'opacity 700ms var(--ease-entrance)' }} />
            {/* connection lines: regional node → districts */}
            {region.cities.map((c, i) => {
              const to = map.cities[c];
              if (!to) return null;
              const [x1, y1] = region.node;
              return (
                <line
                  key={`${region.id}-${c}`}
                  x1={x1}
                  y1={y1}
                  x2={to[0]}
                  y2={to[1]}
                  stroke="#C9A227"
                  stroke-width="1"
                  vector-effect="non-scaling-stroke"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: drawn ? 0 : 1,
                    transition: reduced
                      ? 'none'
                      : `stroke-dashoffset 700ms var(--ease-standard) ${90 * i}ms`,
                  }}
                />
              );
            })}
            {region.cities.map((c) => {
              const to = map.cities[c];
              if (!to) return null;
              return <circle key={`dot-${c}`} cx={to[0]} cy={to[1]} r="7" fill="#E4C368" opacity={drawn ? 1 : 0} style={{ transition: 'opacity 400ms 500ms' }} />;
            })}
            {regions.map((r) => (
              <circle key={`node-${r.id}`} cx={r.node[0]} cy={r.node[1]} r={r.id === active ? 16 : 11} fill={r.id === active ? '#C9A227' : '#0B0E14'} stroke="#C9A227" stroke-width="2.5" style={{ transition: 'all 240ms var(--ease-standard)' }} />
            ))}
          </svg>

          {/* Keyboard-selectable regional nodes (HTML buttons over the SVG) */}
          {regions.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={r.id === active}
              onClick={() => setActive(r.id)}
              class="group absolute flex min-h-6 min-w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center p-3"
              style={{ left: `${(r.node[0] / map.width) * 100}%`, top: `${(r.node[1] / map.height) * 100}%` }}
            >
              <span
                class={`stamp whitespace-nowrap px-2 py-1 transition-colors duration-[240ms] ${
                  r.id === active
                    ? 'bg-gold text-navy'
                    : 'text-mist underline decoration-transparent underline-offset-4 group-hover:text-gold-hi group-hover:decoration-gold-hi group-focus-visible:text-gold-hi'
                }`}
              >
                {r.name}
              </span>
            </button>
          ))}
        </div>
        <p class="stamp mt-4 text-center text-mist">Select a region — keyboard: Tab, then Enter</p>
      </div>

      <div class="col-span-12 lg:col-span-5" aria-live="polite">
        <article class="border-t border-gold pt-6" aria-label={`${region.name} region in focus`}>
          <p class="stamp text-mist">Region in focus</p>
          <h3 class="heading-2 mt-3 text-cream">{region.name} Region</h3>
          <p class="stamp mt-2 text-mist">{region.districts}</p>

          <dl class="mt-8 grid grid-cols-2 gap-6">
            {region.stats.map((s) => (
              <div key={s.label} class="border-t border-line pt-3">
                <dd class="tnum text-[1.8rem] font-bold leading-none text-gold-hi">{s.value}</dd>
                <dt class="stamp mt-2 text-mist">{s.label}</dt>
              </div>
            ))}
          </dl>

          <ul class="mt-8">
            {region.stories.map((s) => (
              <li key={s} class="body-copy flex gap-4 border-t border-line py-3 text-[0.95rem] text-mist-bright last:border-b">
                <span aria-hidden="true" class="mt-[0.65em] inline-block h-px w-5 shrink-0 bg-gold" />
                {s}
              </li>
            ))}
          </ul>

          <ul class="mt-6 flex flex-wrap gap-x-5 gap-y-2" aria-label="Signals of transformation in this region">
            {region.signals.map((s) => (
              <li key={s} class="stamp text-gold">
                {SIGNAL_LABELS[s] ?? s}
              </li>
            ))}
          </ul>

          {photos[region.id] && (
            <figure class="mt-8 border-t border-line pt-6" key={`photo-${region.id}`}>
              <img
                src={photos[region.id].src}
                srcset={photos[region.id].srcset}
                sizes="(max-width: 1023px) 92vw, 34vw"
                width={photos[region.id].width}
                height={photos[region.id].height}
                alt={photos[region.id].alt}
                loading="lazy"
                decoding="async"
                class="lqip max-h-56 w-full object-cover"
                style={{ backgroundImage: `url("${photos[region.id].lqip}")` }}
              />
              <figcaption class="stamp mt-3 text-mist/80">{photos[region.id].caption}</figcaption>
            </figure>
          )}
        </article>
      </div>
    </div>
  );
}
