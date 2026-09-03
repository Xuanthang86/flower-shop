/*
============================================================
FLOWER SHOP — THEME PROVIDER
============================================================

Quản lý giao diện cơ bản:

- Màu chủ đạo
- Màu phụ
- Màu chữ
- Font chữ
- Cỡ chữ cơ bản
- Bo góc
- Cỡ chữ Header

Không tạo ThemeContext riêng.
============================================================
*/

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "flower-shop-theme";

export const DEFAULT_THEME = {
  primaryColor: "#db2777",
  secondaryColor: "#fce7f3",
  textColor: "#1f2937",

  fontFamily:
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  baseFontSize: 16,
  borderRadius: 12,
  headerFontSize: 15,
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
  } catch (error) {
    console.error("Không thể đọc theme:", error);

    return DEFAULT_THEME;
  }
};

const applyTheme = (theme) => {
  const root = document.documentElement;

  root.style.setProperty("--fs-primary", theme.primaryColor);

  root.style.setProperty("--fs-primary-hover", theme.primaryColor);

  root.style.setProperty("--fs-secondary", theme.secondaryColor);

  root.style.setProperty("--fs-text", theme.textColor);

  root.style.setProperty("--fs-font-family", theme.fontFamily);

  root.style.setProperty("--fs-base-font-size", `${theme.baseFontSize}px`);

  root.style.setProperty("--fs-radius", `${theme.borderRadius}px`);

  root.style.setProperty("--fs-header-font-size", `${theme.headerFontSize}px`);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    applyTheme(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.error("Không thể lưu theme:", error);
    }
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
