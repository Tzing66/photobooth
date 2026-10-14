// Pixel Arcade: an 8-bit coin-op cabinet. Navy + neon, hard pixel shadows,
// CRT scanlines and Press Start 2P everywhere.

import type { ReactNode } from "react";
import type { ThemeKit, ToggleProps } from "./types";
import { BackIcon, EXT, STEPS, ScissorsIcon, Svg } from "./shared";

const NAVY = "#1b1b4b";
const DEEP = "#11113a";
const CYAN = "#2de2ff";
const PINK = "#ff3df2";
const YELLOW = "#ffe14d";
const RED = "#ff4747";
const GREEN = "#39ff6a";
const pixel = { fontFamily: "'Press Start 2P'" };
const crisp = { shapeRendering: "crispEdges" as const };

/** Text with a hard offset shadow, the classic 8-bit title look. */
function PixelTitle({ x, y, size, children, fill = YELLOW, shadow = PINK }: { x: number; y: number; size: number; children: ReactNode; fill?: string; shadow?: string }) {
  const off = Math.max(2, size / 8);
  return (
    <>
      <text x={x + off} y={y + off} textAnchor="middle" fontSize={size} fill={shadow} {...pixel}>
        {children}
      </text>
      <text x={x} y={y} textAnchor="middle" fontSize={size} fill={fill} {...pixel}>
        {children}
      </text>
    </>
  );
}

function ChaseLights({ x, y, w, h, step = 10, size = 4 }: { x: number; y: number; w: number; h: number; step?: number; size?: number }) {
  const lights: ReactNode[] = [];
  let i = 0;
  const add = (lx: number, ly: number) => {
    lights.push(
      <rect key={i} x={lx - size / 2} y={ly - size / 2} width={size} height={size} fill={i % 2 ? PINK : YELLOW} className="anim-bulb" style={{ animationDelay: `${(i % 2) * 0.6}s` }} />,
    );
    i++;
  };
  for (let lx = x; lx <= x + w; lx += step) {
    add(lx, y);
    add(lx, y + h);
  }
  for (let ly = y + step; ly < y + h; ly += step) {
    add(x, ly);
    add(x + w, ly);
  }
  return <g {...crisp}>{lights}</g>;
}

function ExteriorArt() {
  const { featured: f, door: d } = EXT;
  // Gathered curtain: vertical bands whose bottoms step up toward the tie-back.
  const bands = Array.from({ length: 10 }, (_, i) => {
    const x = d.x + 52 + i * 6.4;
    const lift = Math.max(0, 4 - Math.abs(i - 1)) * 6;
    return <rect key={i} x={x} y={d.y + 6} width="6.4" height={d.h - 12 - lift} fill={i % 2 ? "#b3122e" : RED} />;
  });
  return (
    <Svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" style={crisp}>
      {/* marquee */}
      <rect x="30" y="12" width="240" height="62" fill={NAVY} stroke={CYAN} strokeWidth="4" />
      <ChaseLights x={38} y={20} w={224} h={46} />
      <PixelTitle x={150} y={52} size={15}>
        PHOTO BOOTH
      </PixelTitle>

      {/* cabinet with pixel side art */}
      <rect x="22" y="78" width="256" height="294" fill="#232365" stroke={CYAN} strokeWidth="4" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={26 + i * 4} y="82" width="2" height="286" fill={[PINK, CYAN, YELLOW][i]} opacity="0.7" />
          <rect x={272 - i * 4} y="82" width="2" height="286" fill={[PINK, CYAN, YELLOW][i]} opacity="0.7" />
        </g>
      ))}

      {/* hi-score board */}
      <text x={f.x + f.w / 2} y={f.y - 9} textAnchor="middle" fontSize="7" fill={YELLOW} {...pixel}>
        HI-SCORES
      </text>
      <rect x={f.x - 4} y={f.y - 4} width={f.w + 8} height={f.h + 8} fill="#000" stroke={CYAN} strokeWidth="3" />

      {/* control panel */}
      <rect x="30" y="232" width="116" height="44" fill="#2e2e7a" stroke={CYAN} strokeWidth="2" />
      <rect x="54" y="246" width="4" height="18" fill="#bbb" />
      <rect x="49" y="238" width="14" height="12" fill={RED} />
      {[YELLOW, PINK, CYAN].map((c, i) => (
        <rect key={c} x={84 + i * 18} y={250 - (i % 2) * 6} width="12" height="12" fill={c} stroke="#000" strokeWidth="2" />
      ))}

      {/* insert coin */}
      <text x="88" y="300" textAnchor="middle" fontSize="7" fill={YELLOW} className="anim-bulb" {...pixel}>
        INSERT COIN
      </text>
      <rect x="60" y="310" width="56" height="36" fill={DEEP} stroke={CYAN} strokeWidth="2" />
      <rect x="72" y="318" width="8" height="14" fill="#ff9a2e" />
      <rect x="96" y="318" width="8" height="14" fill="#ff9a2e" />
      <text x="88" y="342" textAnchor="middle" fontSize="5" fill={CYAN} {...pixel}>
        PLAY
      </text>

      {/* doorway */}
      <text x={d.x + d.w / 2} y={d.y - 4} textAnchor="middle" fontSize="7" fill={GREEN} {...pixel}>
        PLAYER 1
      </text>
      <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="#05051a" stroke={CYAN} strokeWidth="4" />
      {bands}
      <rect x={d.x + 52} y={d.y + 120} width={d.w - 54} height="6" fill={YELLOW} />
      {[
        [d.x + 16, d.y + 40],
        [d.x + 34, d.y + 90],
        [d.x + 12, d.y + 150],
      ].map(([x, y], i) => (
        <g key={i} className="anim-bulb" style={{ animationDelay: `${i * 0.4}s` }}>
          <rect x={x} y={y - 4} width="2" height="10" fill="#fff" />
          <rect x={x - 4} y={y} width="10" height="2" fill="#fff" />
        </g>
      ))}

      {/* checkerboard kick plate */}
      {Array.from({ length: 42 }, (_, i) => (
        <rect key={i} x={24 + (i % 21) * 12.2} y={352 + Math.floor(i / 21) * 9} width="12.2" height="9" fill={(i + Math.floor(i / 21)) % 2 ? "#fff" : "#000"} />
      ))}
    </Svg>
  );
}

function Lightbox() {
  return (
    <Svg viewBox="0 0 600 160" className="h-full w-full" style={crisp}>
      <rect x="6" y="6" width="588" height="148" fill={NAVY} stroke={CYAN} strokeWidth="6" />
      <ChaseLights x={22} y={20} w={556} h={120} step={16} size={7} />
      <PixelTitle x={300} y={92} size={38}>
        PHOTO BOOTH
      </PixelTitle>
      <text x="300" y="124" textAnchor="middle" fontSize="12" fill={CYAN} {...pixel}>
        1UP 00 · HI-SCORE 04
      </text>
    </Svg>
  );
}

const stepCorners = "polygon(0 8px,8px 8px,8px 0,calc(100% - 8px) 0,calc(100% - 8px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 8px) calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,8px calc(100% - 8px),0 calc(100% - 8px))";

function ScreenBezel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0" style={{ filter: `drop-shadow(6px 6px 0 ${PINK})` }}>
      <div className="absolute inset-0 p-[8%]" style={{ background: CYAN, clipPath: stepCorners }}>
        <div className="absolute inset-[4px] p-[7%]" style={{ background: DEEP, clipPath: stepCorners }}>
          <span className="absolute top-[2.5%] left-[8%] text-[8px] md:text-[9px]" style={{ ...pixel, color: GREEN }}>
            PLAYER 1
          </span>
          <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-black">
            {children}
            {/* CRT scanlines + curvature vignette */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 1px, transparent 1px 3px)", boxShadow: "inset 0 0 30px rgba(0,0,0,.65)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EyeLevel() {
  return (
    <div className="text-center text-[8px] leading-loose md:text-[10px]" style={{ ...pixel, color: YELLOW }}>
      LOOK
      <div className="anim-bulb" style={{ color: PINK }}>
        ▶▶
      </div>
    </div>
  );
}

function PriceSticker() {
  return (
    <div className="border-[3px] border-white px-1 py-2 text-center text-white" style={{ ...pixel, background: PINK, boxShadow: "4px 4px 0 #000" }}>
      <div className="text-xl md:text-2xl">x4</div>
      <div className="mt-1 text-[7px] md:text-[8px]">SHOTS</div>
    </div>
  );
}

function Instructions() {
  return (
    <div className="card px-3 py-2.5 text-[8px] leading-[1.9] md:text-[9px]" style={pixel}>
      <div className="mb-1" style={{ color: YELLOW }}>
        HOW TO PLAY
      </div>
      {STEPS.map((s) => (
        <div key={s}>
          <span style={{ color: PINK }}>▶</span> {s.toUpperCase()}
        </div>
      ))}
    </div>
  );
}

function CoinPanel({ onClick, go, label }: { onClick?: () => void; go: boolean; label: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`text-[10px] transition-opacity md:text-xs ${label ? "opacity-100" : "opacity-0"}`} style={{ ...pixel, color: YELLOW, textShadow: `2px 2px 0 ${PINK}` }}>
        {(label ?? "·").toUpperCase()}
      </span>
      <div className="flex w-[4.5rem] flex-col items-center gap-2 border-[3px] px-2 py-3 md:w-20" style={{ borderColor: CYAN, background: "#232365", boxShadow: `4px 4px 0 ${PINK}` }}>
        <span className="text-[6px] md:text-[7px]" style={{ ...pixel, color: CYAN }}>
          PUSH START
        </span>
        <button
          onClick={onClick}
          aria-label={label ?? "button"}
          className={`h-10 w-10 rounded-full border-[3px] border-black transition-transform active:translate-y-0.5 md:h-12 md:w-12 ${go ? "press-me" : ""}`}
          style={{
            background: `radial-gradient(circle at 35% 30%, #fff 0 12%, ${go ? GREEN : RED} 13%)`,
            boxShadow: `0 4px 0 ${go ? "#1a8a3a" : "#8a1a1a"}`,
            ["--ring" as string]: YELLOW,
          }}
        />
      </div>
    </div>
  );
}

function Toggle({ on, onToggle, left, right, label }: ToggleProps) {
  const seg = (active: boolean) => ({ background: active ? YELLOW : NAVY, color: active ? NAVY : CYAN });
  return (
    <button onClick={onToggle} aria-label={label} className="flex border-[3px] text-[8px] md:text-[9px]" style={{ ...pixel, borderColor: CYAN, boxShadow: `3px 3px 0 ${PINK}` }}>
      <span className="px-2.5 py-2 transition-colors" style={seg(!on)}>
        {left.toUpperCase()}
      </span>
      <span className="px-2.5 py-2 transition-colors" style={seg(on)}>
        {right.toUpperCase()}
      </span>
    </button>
  );
}

function PrintTimer({ seconds }: { seconds: number }) {
  return (
    <div className="grid h-full w-full place-items-center border-4 bg-black text-center" style={{ ...pixel, borderColor: CYAN, boxShadow: `6px 6px 0 ${PINK}` }}>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[8px] md:text-[10px]" style={{ color: CYAN }}>
          LOADING
        </span>
        <span className="text-3xl md:text-4xl" style={{ color: YELLOW, textShadow: `3px 3px 0 ${PINK}` }}>
          {String(seconds).padStart(2, "0")}
        </span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-2.5 w-2.5" style={{ background: i < 5 - seconds ? GREEN : "#2a2a5a" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PickupSlot({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-x-0 top-0 z-20 h-[6%] border-[3px]" style={{ borderColor: CYAN, background: "#232365", boxShadow: `4px 4px 0 ${PINK}` }}>
        <div className="mx-auto mt-[5%] h-[35%] w-[82%] bg-black" />
      </div>
      <div className="absolute inset-x-[7%] top-[4%] bottom-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Note({ kind }: { kind: "yourStrip" | "tapToSave" }) {
  return (
    <div className="anim-bulb text-[9px] leading-relaxed md:text-[11px]" style={{ ...pixel, color: YELLOW, textShadow: `2px 2px 0 ${PINK}` }}>
      {kind === "yourStrip" ? "NEW HIGH SCORE!" : "TAP TO SAVE ▶"}
    </div>
  );
}

function IconButton({ kind, onClick }: { kind: "cut" | "back"; onClick: () => void }) {
  const Icon = kind === "cut" ? ScissorsIcon : BackIcon;
  return (
    <button
      onClick={onClick}
      aria-label={kind === "cut" ? "Cut into single photos" : "Back to strip"}
      className="grid h-12 w-12 place-items-center border-[3px] border-white text-white transition-transform active:translate-y-0.5"
      style={{ background: PINK, boxShadow: "4px 4px 0 #000" }}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}

export const arcade: ThemeKit = {
  id: "arcade",
  label: "Pixel Arcade",
  ExteriorArt,
  Lightbox,
  ScreenBezel,
  EyeLevel,
  PriceSticker,
  Instructions,
  CoinPanel,
  Toggle,
  PrintTimer,
  PickupSlot,
  Note,
  IconButton,
};
