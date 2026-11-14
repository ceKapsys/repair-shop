/** Motion tokens (locked, build prompt §11). Mirrors the CSS variables in globals.css. */
export const ease = {
  out: [0.23, 1, 0.32, 1],
  inOut: [0.77, 0, 0.175, 1],
  drawer: [0.32, 0.72, 0, 1],
} as const;

/** Seconds, for Motion transitions. */
export const dur = { press: 0.14, small: 0.18, medium: 0.24, large: 0.32 } as const;

export const stagger = { hero: 0.06, grid: 0.04 } as const;
export const drawerSpring = { type: "spring", duration: 0.35, bounce: 0.1 } as const;

/** Grid item delay: 40 ms per item, capped so long grids don't crawl. */
export const gridDelay = (i: number) => Math.min(i, 8) * stagger.grid;
