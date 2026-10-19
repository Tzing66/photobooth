/** Camera with turn-around arrows: switch front/back camera. */
export const FlipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 7h-3l-2-3H9L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
    <path d="M9 13a3 3 0 0 1 5.2-2M15 13a3 3 0 0 1-5.2 2" />
    <polyline points="14.5 9 14.5 11 12.5 11" />
    <polyline points="9.5 17 9.5 15 11.5 15" />
  </svg>
);

/** Lightning bolt, struck through when off. */
export const FlashIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
    <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2" />
    {!on && <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" />}
  </svg>
);
