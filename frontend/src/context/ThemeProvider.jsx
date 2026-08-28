/*
============================================================
FLOWER SHOP — THEME PROVIDER
============================================================

Cho phép Admin chỉnh các thuộc tính giao diện cơ bản
mà không phải sửa JSX/CSS.

Lưu vào localStorage.

Các thuộc tính:
- primaryColor
- secondaryColor
- textColor
- fontFamily
- baseFontSize
- borderRadius
============================================================
*/

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "flower-shop-theme";

export const DEFAULT_THEME = {
  primaryColor: "#db2777",
  secondaryColor: "#fce7f3",
  textColor: "#1f2937",
  fontFamily: "Inter, system-ui, sans-serif",
  baseFontSize: 16,
  borderRadius: 12,
};

const ThemeContext = createContext(null);

const readTheme = () => {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);

    if (!raw) {
      return DEFAULT_THEME;
    }

    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_THEME,
      ...parsed,
    };
  } catch {
    return DEFAULT_THEME;
  }
};

const applyTheme = (theme) => {
  const root = document.documentElement;

  root.style.setProperty("--fs-primary", theme.primaryColor);

  root.style.setProperty("--fs-secondary", theme.secondaryColor);

  root.style.setProperty("--fs-text", theme.textColor);

  root.style.setProperty("--fs-font-family", theme.fontFamily);

  root.style.setProperty("--fs-base-font-size", `${theme.baseFontSize}px`);

  root.style.setProperty("--fs-radius", `${theme.borderRadius}px`);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    applyTheme(theme);

    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  const updateTheme = (updates) => {
    setTheme((current) => ({
      ...current,
      ...updates,
    }));
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
  };

  const value = useMemo(
    () => ({
      theme,
      updateTheme,
      resetTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme phải được sử dụng bên trong ThemeProvider.");
  }

  return context;
};
