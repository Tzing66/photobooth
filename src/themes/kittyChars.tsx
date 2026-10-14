// Simple vector takes on Hello Kitty and friends. Each is drawn in a 100×100
// box and placed with x/y (top-left) and size.

import type { ReactNode } from "react";

const OUT = "#2b2b2b";
const W = "#ffffff";
export const BOW_RED = "#e60033";
const YELLOW = "#ffd23f";
const PINK = "#ff8fb3";

interface Place {
  x: number;
  y: number;
  size: number;
  rotate?: number;
}

function Placed({ x, y, size, rotate = 0, children }: Place & { children: ReactNode }) {
  return <g transform={`translate(${x} ${y}) rotate(${rotate} ${size / 2} ${size / 2}) scale(${size / 100})`}>{children}</g>;
}

const line = { stroke: OUT, strokeWidth: 3.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export function Bow({ cx, cy, scale = 1, rotate = 0 }: { cx: number; cy: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})`}>
      <ellipse cx={-11} cy={0} rx={11} ry={8.5} fill={BOW_RED} {...line} strokeWidth={2.6} />
      <ellipse cx={11} cy={0} rx={11} ry={8.5} fill={BOW_RED} {...line} strokeWidth={2.6} />
      <circle r={5.5} fill={BOW_RED} {...line} strokeWidth={2.6} />
    </g>
  );
}

export function Kitty(p: Place) {
  return (
    <Placed {...p}>
      <path d="M14 46 L18 10 L44 30 Z" fill={W} {...line} />
      <path d="M86 46 L82 10 L56 30 Z" fill={W} {...line} />
      <ellipse cx="50" cy="56" rx="42" ry="33" fill={W} {...line} />
      <Bow cx={73} cy={22} rotate={15} />
      <ellipse cx="35" cy="58" rx="3.6" ry="5" fill={OUT} />
      <ellipse cx="65" cy="58" rx="3.6" ry="5" fill={OUT} />
      <ellipse cx="50" cy="66" rx="4.5" ry="3.2" fill={YELLOW} {...line} strokeWidth={2} />
      <path d="M2 55 L19 59 M0 65 L18 65 M2 75 L19 71 M98 55 L81 59 M100 65 L82 65 M98 75 L81 71" fill="none" {...line} strokeWidth={2.6} />
    </Placed>
  );
}

export function Melody(p: Place) {
  const hood = "#ffb3cf";
  return (
    <Placed {...p}>
      <ellipse cx="32" cy="22" rx="10" ry="24" transform="rotate(-12 32 22)" fill={hood} {...line} />
      <ellipse cx="68" cy="22" rx="10" ry="24" transform="rotate(12 68 22)" fill={hood} {...line} />
      <circle cx="50" cy="58" r="38" fill={hood} {...line} />
      <ellipse cx="50" cy="66" rx="27" ry="21" fill={W} {...line} strokeWidth={2.6} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return <circle key={i} cx={71 + Math.cos(a) * 5} cy={34 + Math.sin(a) * 5} r="4.4" fill="#ff5c8a" {...line} strokeWidth={1.4} />;
      })}
      <circle cx="71" cy="34" r="3" fill={YELLOW} />
      <ellipse cx="40" cy="65" rx="2.8" ry="4" fill={OUT} />
      <ellipse cx="60" cy="65" rx="2.8" ry="4" fill={OUT} />
      <ellipse cx="50" cy="72" rx="3" ry="2.2" fill={YELLOW} {...line} strokeWidth={1.6} />
      <path d="M46 77 Q50 80 54 77" fill="none" {...line} strokeWidth={2} />
    </Placed>
  );
}

export function Kuromi(p: Place) {
  return (
    <Placed {...p}>
      <path d="M24 46 Q4 2 40 24 Z" fill={OUT} />
      <path d="M76 46 Q96 2 60 24 Z" fill={OUT} />
      <circle cx="50" cy="58" r="37" fill={OUT} />
      <circle cx="50" cy="34" r="8" fill={PINK} />
      <circle cx="47" cy="33" r="1.8" fill={OUT} />
      <circle cx="53" cy="33" r="1.8" fill={OUT} />
      <rect x="47.5" y="37.5" width="5" height="2" rx="1" fill={OUT} />
      <ellipse cx="50" cy="67" rx="26" ry="19" fill={W} {...line} strokeWidth={2.6} />
      <ellipse cx="41" cy="66" rx="3" ry="4.3" fill={OUT} />
      <ellipse cx="59" cy="66" rx="3" ry="4.3" fill={OUT} />
      <ellipse cx="50" cy="72" rx="2.6" ry="1.8" fill={PINK} />
      <path d="M44 76 Q50 81 56 76" fill="none" {...line} strokeWidth={2} />
    </Placed>
  );
}

export function Keroppi(p: Place) {
  return (
    <Placed {...p}>
      <ellipse cx="50" cy="64" rx="42" ry="27" fill="#6cc04a" {...line} />
      <circle cx="31" cy="34" r="15" fill={W} {...line} />
      <circle cx="69" cy="34" r="15" fill={W} {...line} />
      <circle cx="33" cy="36" r="6.5" fill={OUT} />
      <circle cx="67" cy="36" r="6.5" fill={OUT} />
      <circle cx="35" cy="33.5" r="2" fill={W} />
      <circle cx="69" cy="33.5" r="2" fill={W} />
      <path d="M30 66 Q50 86 70 66" fill="none" {...line} />
      <ellipse cx="22" cy="70" rx="6" ry="4" fill={PINK} opacity="0.85" />
      <ellipse cx="78" cy="70" rx="6" ry="4" fill={PINK} opacity="0.85" />
    </Placed>
  );
}

export function Purin(p: Place) {
  const brown = "#8b5a2b";
  return (
    <Placed {...p}>
      <ellipse cx="50" cy="60" rx="38" ry="31" fill="#ffd56b" {...line} />
      <ellipse cx="16" cy="62" rx="9" ry="17" transform="rotate(18 16 62)" fill={brown} {...line} />
      <ellipse cx="84" cy="62" rx="9" ry="17" transform="rotate(-18 84 62)" fill={brown} {...line} />
      <ellipse cx="50" cy="30" rx="22" ry="8" fill="#6e4220" {...line} />
      <rect x="48" y="18" width="4" height="6" rx="1.5" fill="#6e4220" {...line} strokeWidth={2} />
      <circle cx="38" cy="60" r="3.2" fill={OUT} />
      <circle cx="62" cy="60" r="3.2" fill={OUT} />
      <ellipse cx="50" cy="67" rx="3.6" ry="2.4" fill="#5a3a1a" />
      <path d="M46 71 Q50 74 54 71" fill="none" {...line} strokeWidth={2} />
    </Placed>
  );
}

/** Standalone SVG for HTML contexts. */
export function CharIcon({ who, className }: { who: "kitty" | "melody" | "kuromi" | "keroppi" | "purin"; className?: string }) {
  const C = { kitty: Kitty, melody: Melody, kuromi: Kuromi, keroppi: Keroppi, purin: Purin }[who];
  return (
    <svg viewBox="-4 -4 108 108" className={className} aria-hidden>
      <C x={0} y={0} size={100} />
    </svg>
  );
}
