import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[arguments.length=0][callee.type='MemberExpression'][callee.property.name=/^toLocale(Date|Time)?String$/]",
          message:
            "Argument-less .toLocaleDateString() / .toLocaleString() / .toLocaleTimeString() causes SSR hydration mismatch (Node default locale ≠ browser locale). Use `formatDate` from `@/src/shared/lib/formatDate`, or the `useFormatDate` hook for i18n-aware locale (numbers: `formatPrice`).",
        },
      ],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**"],
  },
]
