import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "flower-shop-theme";
const DEFAULT_THEME = { primary: "#db2777", primaryHover: "#be185d", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", fontSize: 16, radius: 12 };
const ThemeContext = createContext(null);

const readTheme = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return { ...DEFAULT_THEME, ...(parsed || {}) };
  } catch { return DEFAULT_THEME; }
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => readTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", theme.primary);
    root.style.setProperty("--color-primary-hover", theme.primaryHover);
    root.style.setProperty("--font-family", theme.fontFamily);
    root.style.setProperty("--base-font-size", `${theme.fontSize}px`);
    root.style.setProperty("--radius-base", `${theme.radius}px`);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    window.dispatchEvent(new Event("flower-shop-theme-updated"));
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, resetTheme: () => setTheme(DEFAULT_THEME) }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme phải được sử dụng bên trong ThemeProvider.");
  return context;
};

export default ThemeProvider;
