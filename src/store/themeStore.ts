import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: true,

      toggleDarkMode: () => {
        const newMode = !get().isDarkMode;
        set({ isDarkMode: newMode });
        
        // Apply theme to document
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setDarkMode: (isDark: boolean) => {
        set({ isDarkMode: isDark });
        
        // Apply theme to document
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'theme-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Initialize theme on app load
export const initializeTheme = () => {
  const { isDarkMode } = useThemeStore.getState();
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};