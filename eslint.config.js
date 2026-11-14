
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },

  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      "react-hooks": reactHooks,
    },

    rules: {
      // منع استدعاء Hooks خارج مكونات React أو داخل الشروط والحلقات
      "react-hooks/rules-of-hooks": "error",

      // التنبيه عند وجود مشكلات في dependencies الخاصة بالـ Hooks
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
