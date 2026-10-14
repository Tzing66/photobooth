// Hand-drawn sketchbook: ink on paper, cobalt + highlighter accents, and a
// constant "boil" so every line jitters like frame-by-frame animation.

import type { ReactNode } from "react";
import type { ThemeKit, ToggleProps } from "./types";
import { ArrowDown, BackIcon, EXT, STEPS, ScissorsIcon, Svg, useBoil } from "./shared";

const INK = "#1d1d1f";
const PAPER = "#fffdf7";
const BLUE = "#2f5bff";
const YELLOW = "#ffe45c";
const font = { fontFamily: "Gaegu", fontWeight: 700 };

/** Ink group with the boil filter applied. */
function Ink({ children, width = 2.2 }: { children: ReactNode; width?: number }) {
  const filter = useBoil();
  return (
    <g filter={filter} stroke={INK} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {children}
    </g>
  );
}

/** Boiling wrapper for HTML decor. */
function Boil({ children, className = "" }: { children: ReactNode; className?: string }) {
  const filter = useBoil();
  return (
    <div className={className} style={{ filter }}>
      {children}
    </div>
  );
}

/** Slightly crooked double-stroked rectangle. */
function SketchRect({ x, y, w, h, fill = "none" }: { x: number; y: number; w: number; h: number; fill?: string }) {
  return (
    <>
      <path d={`M${x} ${y + 1} L${x + w + 1} ${y} L${x + w} ${y + h + 1} L${x - 1} ${y + h} Z`} fill={fill} />
      <path d={`M${x + 1} ${y - 1} L${x + w - 1} ${y + 1} L${x + w + 1} ${y + h - 1} L${x} ${y + h + 1} L${x + 1} ${y + 3}`} strokeWidth={1.2} />
    </>
  );
}

function Hatch({ x, y, w, h, gap = 7 }: { x: number; y: number; w: number; h: number; gap?: number }) {
  const lines = [];
  for (let i = -h; i < w; i += gap) {
    const x1 = Math.max(x, x + i);
    const y1 = y + Math.max(0, -i);
    const x2 = Math.min(x + w, x + i + h);
    const y2 = y + Math.min(h, w - i);
    lines.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={0.9} opacity={0.55} />);
  }
  return <>{lines}</>;
}

function ExteriorArt() {
  const { featured: f, door: d } = EXT;
  return (
    <Svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full">
      <Ink>
        {/* ground */}
        <path d="M6 374 Q80 370 150 375 T294 372" />
        <path d="M30 380 h18 M70 382 h10 M240 381 h22" strokeWidth={1.2} />

        {/* cabinet */}
        <SketchRect x={22} y={80} w={256} h={292} fill={PAPER} />
        <Hatch x={270} y={84} w={8} h={286} gap={5} />

        {/* sign */}
        <SketchRect x={40} y={14} w={220} h={56} fill={YELLOW} />
        <path d="M70 70 L74 82 M230 70 L226 82" />

        {/* featured board with tape */}
        <SketchRect x={f.x - 3} y={f.y - 3} w={f.w + 6} h={f.h + 6} fill="#efece4" />
        <path d={`M${f.x - 10} ${f.y - 6} l18 8 M${f.x + f.w - 8} ${f.y + 2} l18 -8`} stroke={BLUE} strokeWidth={7} opacity={0.5} />

        {/* doodles on the side */}
        <path d="M46 250 l6 -14 l6 14 l-14 -9 h16 z" stroke={BLUE} />
        <path d="M108 262 c-8 -10 -20 -2 -10 8 l10 9 l10 -9 c10 -10 -2 -18 -10 -8 z" stroke="#ef4b3f" />
        <path d="M40 300 q10 -8 20 0 t20 0 t20 0 t20 0" />
        <path d="M60 330 h50 M60 340 h36" strokeWidth={1.2} />

        {/* doorway + curtain */}
        <SketchRect x={d.x} y={d.y} w={d.w} h={d.h} fill="#e9e6de" />
        <path d={`M${d.x - 4} ${d.y + 4} H${d.x + d.w + 4}`} strokeWidth={3} />
        <path
          d={`M${d.x + 58} ${d.y + 6} Q${d.x + 74} ${d.y + 120} ${d.x + 64} ${d.y + 258} H${d.x + d.w - 2} V${d.y + 6} Z`}
          fill={PAPER}
        />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${d.x + 72 + i * 11} ${d.y + 10} Q${d.x + 80 + i * 11} ${d.y + 130} ${d.x + 74 + i * 11} ${d.y + 255}`} strokeWidth={1.3} />
        ))}
        <Hatch x={d.x + 4} y={d.y + 10} w={48} h={244} gap={9} />
        <path d={`M${d.x + 6} ${d.y + 200} h42 M${d.x + 12} ${d.y + 200} v56 M${d.x + 42} ${d.y + 200} v56`} />
      </Ink>
      <text x="150" y="51" textAnchor="middle" fontSize="34" fill={INK} {...font}>
        photobooth!
      </text>
      <text x={f.x + f.w / 2} y={f.y - 10} textAnchor="middle" fontSize="11" fill={BLUE} {...font}>
        past strips ↓
      </text>
      <text x={EXT.enter.x - 4} y={EXT.enter.y - 34} textAnchor="middle" fontSize="12" fill={INK} {...font} transform={`rotate(-6 ${EXT.enter.x} ${EXT.enter.y - 34})`}>
        come in!
      </text>
    </Svg>
  );
}

function Lightbox() {
  return (
    <Svg viewBox="0 0 600 160" className="h-full w-full">
      <Ink width={3.5}>
        <SketchRect x={20} y={16} w={560} h={124} fill={YELLOW} />
        {[60, 110, 490, 540].map((x) => (
          <path key={x} d={`M${x} 40 l6 -10 l6 10`} strokeWidth={2} />
        ))}
        <path d="M20 16 L8 4 M580 16 L592 4" strokeWidth={2} />
      </Ink>
      <text x="300" y="100" textAnchor="middle" fontSize="78" fill={INK} {...font}>
        photobooth!
      </text>
      <path d="M180 118 Q300 132 420 116" stroke={BLUE} strokeWidth="5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function ScreenBezel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0">
      <Svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <Ink width={3}>
          <SketchRect x={6} y={6} w={288} h={388} fill={PAPER} />
          <circle cx="150" cy="22" r="6" />
          <Hatch x={6} y={380} w={288} h={14} gap={6} />
        </Ink>
      </Svg>
      <div className="absolute inset-[9%] overflow-hidden rounded-sm border-[2.5px] bg-[#e9e6de]" style={{ borderColor: INK }}>
        {children}
      </div>
    </div>
  );
}

function PriceSticker() {
  return (
    <Boil className="rotate-6">
      <div className="relative grid aspect-square w-full place-items-center rounded-full border-[2.5px] text-center leading-none" style={{ borderColor: INK, background: YELLOW, color: INK }}>
        <div className="text-sm font-bold md:text-base">
          4 pics
          <br />
          <span className="text-lg md:text-xl" style={{ color: BLUE }}>
            free!
          </span>
        </div>
      </div>
    </Boil>
  );
}

function Instructions() {
  return (
    <Boil>
      <div className="card -rotate-1 px-3 py-2 text-base leading-tight md:text-lg">
        <div className="mb-0.5 font-bold underline decoration-wavy" style={{ textDecorationColor: BLUE }}>
          how to:
        </div>
        {STEPS.map((s, i) => (
          <div key={s}>
            {i + 1}. {s}
          </div>
        ))}
      </div>
    </Boil>
  );
}

function CoinPanel({ onClick, go, label }: { onClick?: () => void; go: boolean; label: string | null }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-xl font-bold md:text-2xl transition-opacity ${label ? "opacity-100" : "opacity-0"}`} style={{ color: BLUE }}>
        {label ?? "·"} ↓
      </span>
      <Boil>
        <div className="card flex w-16 flex-col items-center gap-2 px-2 py-3 md:w-20">
          <span className="h-5 w-1.5 rounded-sm" style={{ background: INK }} />
          <button
            onClick={onClick}
            aria-label={label ?? "button"}
            className={`h-9 w-9 rounded-full border-[2.5px] transition-transform active:scale-90 md:h-11 md:w-11 ${go ? "press-me" : ""}`}
            style={{ borderColor: INK, background: go ? "var(--t-go)" : "var(--t-stop)", ["--ring" as string]: INK }}
          />
        </div>
      </Boil>
    </div>
  );
}

function Toggle({ on: color, onToggle, left, right, label }: ToggleProps) {
  return (
    <div className="flex items-center gap-3 text-lg font-bold md:text-xl">
      <span className={color ? "opacity-40" : ""}>{left}</span>
      <Boil>
        <button onClick={onToggle} aria-label={label} className="relative h-8 w-16 rounded-full border-[2.5px] bg-white" style={{ borderColor: INK }}>
          <span
            className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-[2.5px] transition-all duration-300"
            style={{ borderColor: INK, left: color ? "calc(100% - 1.7rem)" : "2px", background: color ? "linear-gradient(135deg,#ef4b3f,#ffe45c,#2f5bff)" : INK }}
          />
        </button>
      </Boil>
      <span className={color ? "" : "opacity-40"}>{right}</span>
    </div>
  );
}

function PrintTimer({ seconds }: { seconds: number }) {
  return (
    <Boil className="h-full w-full">
      <div className="card grid h-full w-full place-items-center rounded-full! text-center text-base leading-tight font-bold md:text-lg">
        <div>
          photos delivered
          <br />
          here in
          <div className="text-4xl leading-none" style={{ color: BLUE }}>
            {seconds}
          </div>
          seconds
          <ArrowDown className="anim-bob mx-auto h-5 w-5" />
        </div>
      </div>
    </Boil>
  );
}

function PickupSlot({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <Boil className="absolute inset-x-0 top-0 z-20 h-[6%]">
        <div className="h-full rounded-sm border-[2.5px] bg-white" style={{ borderColor: INK }}>
          <div className="mx-auto mt-[5%] h-[35%] w-[82%]" style={{ background: INK }} />
        </div>
      </Boil>
      <div className="absolute inset-x-[7%] top-[4%] bottom-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Note({ kind }: { kind: "yourStrip" | "tapToSave" }) {
  return (
    <Boil className="-rotate-6">
      <div className="text-center text-xl leading-tight font-bold md:text-2xl" style={{ color: BLUE }}>
        {kind === "yourStrip" ? "your photostrip!" : "tap one to save!"}
        <div className="text-base">⤹</div>
      </div>
    </Boil>
  );
}

function IconButton({ kind, onClick }: { kind: "cut" | "back"; onClick: () => void }) {
  const Icon = kind === "cut" ? ScissorsIcon : BackIcon;
  return (
    <Boil>
      <button
        onClick={onClick}
        aria-label={kind === "cut" ? "Cut into single photos" : "Back to strip"}
        className="grid h-12 w-12 place-items-center rounded-full border-[2.5px] bg-white transition-transform hover:scale-110 md:h-14 md:w-14"
        style={{ borderColor: INK, color: INK }}
      >
        <Icon className="h-6 w-6" />
      </button>
    </Boil>
  );
}

export const sketch: ThemeKit = {
  id: "sketch",
  label: "Sketchbook",
  ExteriorArt,
  Lightbox,
  ScreenBezel,
  PriceSticker,
  Instructions,
  CoinPanel,
  Toggle,
  PrintTimer,
  PickupSlot,
  Note,
  IconButton,
};
