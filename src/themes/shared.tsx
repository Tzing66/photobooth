import { useSyncExternalStore, type ReactNode, type SVGProps } from "react";

/**
 * Exterior geometry in the 300×400 viewBox. Every theme's ExteriorArt draws
 * its board and doorway at these spots; ExteriorShell lays the live buttons
 * on top using the same numbers.
 */
export const EXT = {
  w: 300,
  h: 400,
  featured: { x: 32, y: 118, w: 106, h: 96 },
  door: { x: 152, y: 92, w: 116, h: 260 },
  enter: { x: 210, y: 226 },
  footerY: 386,
};

export function Svg({ viewBox, children, className, ...rest }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg viewBox={viewBox} className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden {...rest}>
      {children}
    </svg>
  );
}

/** Evenly spaced points around a rectangle's edge (marquee bulbs, sprocket holes...). */
export function perimeter(x: number, y: number, w: number, h: number, spacing: number) {
  const pts: [number, number][] = [];
  const len = 2 * (w + h);
  const n = Math.floor(len / spacing);
  for (let i = 0; i < n; i++) {
    let d = (i * len) / n;
    if (d < w) pts.push([x + d, y]);
    else if ((d -= w) < h) pts.push([x + w, y + d]);
    else if ((d -= h) < w) pts.push([x + w - d, y + h]);
    else pts.push([x, y + h - (d - w)]);
  }
  return pts;
}

// --- "boil": the jittery redraw of hand-drawn animation --------------------
// Three displacement filters with different noise seeds, cycled every 150ms.
// One shared timer drives every sketchy element on the page.

const BOIL_FRAMES = 3;
let boilFrame = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    timer = setInterval(() => {
      boilFrame = (boilFrame + 1) % BOIL_FRAMES;
      listeners.forEach((l) => l());
    }, 150);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export function useBoil(): string {
  const f = useSyncExternalStore(subscribe, () => boilFrame);
  return `url(#boil-${f})`;
}

export function BoilDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      {Array.from({ length: BOIL_FRAMES }, (_, i) => (
        <filter id={`boil-${i}`} key={i} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={i * 7 + 3} />
          <feDisplacementMap in="SourceGraphic" scale="2.6" />
        </filter>
      ))}
    </svg>
  );
}

// --- icons -----------------------------------------------------------------

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ScissorsIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...p}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
  </svg>
);

export const BackIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...p}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>
);

export const ArrowDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...p}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

/** Instruction steps shared by every theme's instruction card. */
export const STEPS = ["pick a frame", "press the button", "strike 4 poses", "collect your strip"];
