/**
 * sh-ui-cli 외부 노출 API.
 *
 * apps/docs 같은 다른 워크스페이스 패키지가 플러그인 메타데이터와 enum 을
 * 동기화 없이 사용하도록. package.json 의 "exports": { "./api": "./src/api.js" }
 * 로 노출되며, 사용자는 다음과 같이 import:
 *
 *   import { allPlugins, CREATE_PLATFORMS } from 'sh-ui-cli/api';
 */

export {
  CREATE_PLATFORMS,
  CREATE_STRUCTURES,
  INIT_PLATFORMS,
  THEME_BASES,
  THEME_RADII,
  THEME_MODES,
  INIT_DEFAULTS,
  CSS_FRAMEWORKS_SUPPORTED,
  CSS_FRAMEWORKS_PLANNED,
  CSS_FRAMEWORKS_ALL,
  CSS_FRAMEWORK_DEFAULT,
} from './constants.js';

export { allPlugins } from './create/plugins/index.js';
export {
  allArchitectures,
  DEFAULT_ARCH,
  getArchByName,
  getArchesForPlatform,
  isKnownArch,
} from './create/architectures/index.js';
export { THEME_PRESETS, THEME_PRESET_NAMES } from './create/theme/presets.js';
export { describeTemplate } from './create/describeTemplate.js';
export { TEMPLATE_MANIFEST } from './create/templateManifest.js';
