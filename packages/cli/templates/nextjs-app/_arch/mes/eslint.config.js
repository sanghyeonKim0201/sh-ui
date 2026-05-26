import { nextJsConfig } from "@workspace/eslint-config/next-js"
import { mesConfig } from "@workspace/eslint-config/mes"
import { shUiDisciplineConfig } from "@workspace/eslint-config/sh-ui-discipline"

export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  },
  ...nextJsConfig,
  ...mesConfig,
  ...shUiDisciplineConfig,
]
