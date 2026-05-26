import { nextJsConfig } from "@workspace/eslint-config/next-js"
import { flatConfig } from "@workspace/eslint-config/flat"
import { shUiDisciplineConfig } from "@workspace/eslint-config/sh-ui-discipline"

export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  },
  ...nextJsConfig,
  ...flatConfig,
  ...shUiDisciplineConfig,
]
