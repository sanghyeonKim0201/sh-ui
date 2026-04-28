import { nextJsConfig } from "@workspace/eslint-config/next-js"
import { fsdConfig } from "@workspace/eslint-config/fsd"

export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  },
  ...nextJsConfig,
  ...fsdConfig,
]
