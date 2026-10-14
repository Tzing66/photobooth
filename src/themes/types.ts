import type { FC, ReactNode } from "react";

export type ThemeId = "retro" | "sketch" | "darkroom" | "arcade" | "photoboy" | "kitty";

/** Two-way switch (b&w ↔ colour, normal ↔ authentic). `on` = right option selected. */
export interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  left: string;
  right: string;
  label: string;
}

/**
 * A theme only supplies decor: all behaviour lives in the pages. Every piece
 * maps onto a fixed spot in the shared layouts (see ExteriorShell / BoothInterior).
 */
export interface ThemeKit {
  id: ThemeId;
  label: string;

  /** Outside of the booth, drawn into a 300×400 SVG viewBox (see EXTERIOR geometry). */
  ExteriorArt: FC;

  // Inside the booth
  Lightbox: FC;
  ScreenBezel: FC<{ children: ReactNode }>;
  PriceSticker: FC;
  Instructions: FC;
  CoinPanel: FC<{ onClick?: () => void; go: boolean; label: string | null }>;
  Toggle: FC<ToggleProps>;

  // Print + pickup
  PrintTimer: FC<{ seconds: number }>;
  PickupSlot: FC<{ children: ReactNode }>;
  /** Hand-lettered callouts next to the finished strip. */
  Note: FC<{ kind: "yourStrip" | "tapToSave" }>;
  /** Small icon buttons beside the strip: cut into singles / back to strip. */
  IconButton: FC<{ kind: "cut" | "back"; onClick: () => void }>;
}
