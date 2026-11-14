import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Colours live only in src/app/globals.css (design tokens). Components use token classes.
const HEX = "#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b";
const FUNC = "\\b(?:rgba?|hsla?|oklch|oklab)\\(";
const PALETTE =
  "\\b(?:bg|text|border|ring|fill|stroke|from|via|to|divide|outline|accent|decoration|placeholder|caret|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\\d{2,3})?\\b";
const rawColour = [HEX, FUNC, PALETTE].flatMap((re) => [
  { selector: `Literal[value=/${re}/]`, message: "Raw colour. Use a design token class (bg-primary, text-ink, border-line…)." },
  { selector: `TemplateElement[value.raw=/${re}/]`, message: "Raw colour. Use a design token class (bg-primary, text-ink, border-line…)." },
]);

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*.{ts,tsx}"],
    // Email clients ignore CSS variables, so the email palette is the one exception.
    ignores: ["src/emails/**"],
    rules: { "no-restricted-syntax": ["error", ...rawColour] },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-*/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
    ],
  },
];

export default eslintConfig;
