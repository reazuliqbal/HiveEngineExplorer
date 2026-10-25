import { useDark, useToggle } from '@vueuse/core';

/**
 * Shared dark-mode state. Persists the choice to localStorage
 * (`vueuse-color-scheme`) and toggles the `dark` class on <html>,
 * which drives both Tailwind's `dark:` variant and Nuxt UI's CSS variables.
 */
export default function useDarkMode() {
  const isDark = useDark();
  const toggle = useToggle(isDark);

  return { isDark, toggle };
}
