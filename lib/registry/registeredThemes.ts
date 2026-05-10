/** Theme keys that have first-class support in the app (registry + catalog). */
export const registeredThemeKeys = ["modern", "minimal", "bold"] as const;

export type RegisteredThemeKey = (typeof registeredThemeKeys)[number];
