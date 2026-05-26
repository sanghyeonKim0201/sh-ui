import { nextJsConfig } from "@workspace/eslint-config/next-js"
import { fsdConfig } from "@workspace/eslint-config/fsd"
import { shUiDisciplineConfig } from "@workspace/eslint-config/sh-ui-discipline"

export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  },
  ...nextJsConfig,
  ...fsdConfig,
  ...shUiDisciplineConfig,
]
