import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),

  {
    files: ["**/*.{js,jsx}"],

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      /*
       * Các rule dưới đây là các rule kiểm tra pattern nâng cao
       * của React Compiler / React Refresh.
       *
       * Flower Shop hiện chưa bật React Compiler.
       *
       * Một số component chủ động đồng bộ state với:
       * - localStorage;
       * - sessionStorage;
       * - URL;
       * - browser API;
       * - external store;
       * - dữ liệu người dùng.
       *
       * Vì vậy không biến các pattern này thành build/lint blocker.
       *
       * Những lỗi JavaScript thực tế, import/export, undefined
       * và dependency của hook vẫn tiếp tục được ESLint kiểm tra.
       */

      "react-hooks/set-state-in-effect": "warn",

      "react-hooks/preserve-manual-memoization": "warn",

      /*
       * Một số Context/Provider cần export component và API
       * liên quan cùng module.
       *
       * Đây là cấu trúc có chủ đích của project, không phải
       * lỗi runtime.
       */
      "react-refresh/only-export-components": "warn",
    },
  },
]);
