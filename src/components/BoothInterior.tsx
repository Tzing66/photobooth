import { useState, type ReactNode } from "react";
import { isAuthentic, isColorMode, setAuthentic, setColorMode } from "../lib/frames";
import { useTheme } from "../themes/ThemeContext";

interface Props {
  children: ReactNode;
  /** Text above the coin button; null hides it. */
  actionLabel?: string | null;
  /** Green = ready to press, red = idle/disabled. */
  actionReady?: boolean;
  onAction?: () => void;
  onSettingsChange?: (s: { color: boolean; authentic: boolean }) => void;
}

/**
 * Inside the booth: lightbox sign, the screen (children render on it), eye
 * level marker, price sticker, b&w/colour toggle, instructions and the coin
 * button that drives each step.
 */
export default function BoothInterior({ children, actionLabel = null, actionReady = false, onAction, onSettingsChange }: Props) {
  const { kit } = useTheme();
  const [color, setColor] = useState(isColorMode);
  const [authentic, setAuth] = useState(isAuthentic);

  const toggleColor = () => {
    setColor(!color);
    setColorMode(!color);
    onSettingsChange?.({ color: !color, authentic });
  };
  const toggleLook = () => {
    setAuth(!authentic);
    setAuthentic(!authentic);
    onSettingsChange?.({ color, authentic: !authentic });
  };

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-start gap-3 overflow-auto px-4 pt-5 pb-16 sm:pb-6 md:gap-4">
      <div className="h-[clamp(64px,15dvh,150px)] w-full max-w-2xl shrink-0">
        <kit.Lightbox />
      </div>

      <div className="relative shrink-0" style={{ width: "min(68vw, calc(46dvh * 0.75), 22rem)", aspectRatio: "3 / 4" }}>
        <div className="absolute right-full top-[28%] z-20 mr-1 w-[3.2rem] max-[350px]:hidden md:mr-3 md:w-[4.5rem]">
          <kit.EyeLevel />
        </div>
        <kit.ScreenBezel>{children}</kit.ScreenBezel>
        <div className="absolute bottom-[6%] left-full z-20 ml-1 w-[3.6rem] max-[350px]:hidden md:ml-4 md:w-[5rem]">
          <kit.PriceSticker />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        <kit.Toggle on={color} onToggle={toggleColor} left="b&w" right="color" label="Toggle colour mode" />
        <kit.Toggle on={authentic} onToggle={toggleLook} left="normal" right="authentic" label="Toggle authentic booth look" />
      </div>

      <div className="flex w-full max-w-md items-end justify-center gap-4 md:max-w-lg">
        <div className="max-w-[16rem] flex-1">
          <kit.Instructions />
        </div>
        <kit.CoinPanel onClick={onAction} go={actionReady} label={actionLabel} />
      </div>
    </div>
  );
}
