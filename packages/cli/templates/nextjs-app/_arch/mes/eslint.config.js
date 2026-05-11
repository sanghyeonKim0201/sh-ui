import { nextJsConfig } from "@workspace/eslint-config/next-js"
import { mesConfig } from "@workspace/eslint-config/mes"

export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  },
  ...nextJsConfig,
  ...mesConfig,
]
