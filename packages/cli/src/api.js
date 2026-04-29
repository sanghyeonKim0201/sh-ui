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
} from './constants.js';

export { allPlugins } from './create/plugins/index.js';
