import { config } from "@workspace/eslint-config/react-internal"
import { shUiDisciplineConfig } from "@workspace/eslint-config/sh-ui-discipline"

export default [...config, ...shUiDisciplineConfig]
