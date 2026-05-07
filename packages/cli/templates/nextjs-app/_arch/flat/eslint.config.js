import { nextJsConfig } from "@workspace/eslint-config/next-js"
import { flatConfig } from "@workspace/eslint-config/flat"

export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  },
  ...nextJsConfig,
  ...flatConfig,
]
