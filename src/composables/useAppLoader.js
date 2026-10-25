import { useLoading } from 'vue-loading-overlay';
import useDarkMode from './useDarkMode';

/**
 * Fullscreen loader with a theme-aware background so the overlay
 * doesn't flash white in dark mode.
 */
export default function useAppLoader() {
  const { isDark } = useDarkMode();
  const loading = useLoading();

  return {
    isDark,
    show: (props = {}) => loading.show({
      color: 'red',
      backgroundColor: isDark.value ? '#171717' : '#ffffff',
      ...props,
    }),
  };
}
