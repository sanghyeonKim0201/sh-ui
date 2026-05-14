import { z } from 'zod';

/**
 * 아키텍처 디스크립터 스키마.
 * architectures/index.js 로딩 시 모든 디스크립터를 이 스키마로 validate 한다.
 *
 * arch 는 플러그인과 별개의 1급 개념이다 — 프로젝트의 *모양* (폴더 구조,
 * import alias 컨벤션) 을 정의하고, 플러그인은 이 디스크립터의 논리 키
 * (`paths.api`, `aliases.providers` 등) 를 조회해 자신의 산출물을 emit 한다.
 *
 * 디자인 원칙:
 * - 논리 키는 arch 중립적 — `layouts`, `providers`, `api`, `config`, `hooks`,
 *   `utils`, `ui`, `test`. FSD 의 `shared/*` 같은 슬라이스 명칭이 키에 누수되지 않게.
 * - 모든 arch 는 **동일한 키 셋** 을 노출해야 함 (플러그인이 안전하게 조회).
 *   누락 시 스키마가 즉시 거부.
 * - `paths` 는 fs 경로 (앱 루트 기준 상대), `aliases` 는 import 시 사용할 prefix.
 *   둘은 1:1 대응 (paths.foo 디렉토리 = aliases.foo 가 가리키는 곳).
 * - `tsconfigPaths` 는 tsconfig.json 의 paths 블록에 그대로 들어가는 객체.
 *   arch 마다 `@/*` 한 줄일 수도, 더 세분화될 수도 있음.
 */

const PathKeys = z.object({
  layouts:    z.string().min(1),
  providers:  z.string().min(1),
  api:        z.string().min(1),
  config:     z.string().min(1),
  hooks:      z.string().min(1),
  utils:      z.string().min(1),
  ui:         z.string().min(1),
  test:       z.string().min(1),
});

export const ArchSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9-]*$/, {
    message: 'Architecture name must be lowercase kebab-case (e.g., "fsd", "flat")',
  }),
  label: z.string().min(1),
  description: z.string().min(1),

  // 이 arch 가 적용 가능한 플랫폼들. CLI 에서 platform/arch 조합이 호환되는지 검증.
  // 예: fsd/flat 은 ['next'], 미래에 추가될 flutter-clean 은 ['flutter'].
  // 같은 이름의 arch 가 두 플랫폼 모두 지원하는 케이스도 가능 (예: 'flat' 가 양쪽).
  platforms: z.array(z.enum(['next', 'flutter', 'vite'])).min(1),

  // 논리 키 → 파일시스템 경로 (앱 루트 기준 상대)
  paths: PathKeys,

  // 논리 키 → import alias prefix (TS 코드에서 emit 할 때 사용)
  aliases: PathKeys,

  // tsconfig.json 의 paths 필드에 그대로 들어가는 객체
  // 예: FSD 는 { '@/*': ['./*'] }, flat 은 더 세분화
  // Flutter arch 의 경우 이 필드는 사실상 무시됨 (Dart 는 tsconfig 가 없음).
  tsconfigPaths: z.record(z.string(), z.array(z.string())),
});

export function validateArchitectures(architectures) {
  for (const arch of architectures) {
    const result = ArchSchema.safeParse(arch);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      throw new Error(
        `Invalid architecture descriptor "${arch?.name ?? '(unknown)'}":\n${issues}`,
      );
    }
  }
}
