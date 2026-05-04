# sh-ui CLI — 아키텍처 (arch) 시스템

이 문서는 sh-ui CLI 의 **arch** 컨셉, 디스크립터 모델, 새 arch 추가 방법을 다룬다. 사용자용 비교 가이드는 `apps/docs` 사이트의 Architectures 섹션 참고.

## 개념

**arch** 는 sh-ui 가 스캐폴드하는 프로젝트의 *모양* 을 결정하는 1급 개념이다. 폴더 구조 (`src/shared/api` vs `lib/api`), import alias 컨벤션 (`@/*` vs `@/lib/*` 분리), tsconfig `paths` 블록을 한 묶음으로 정의한다.

**플러그인** 과는 직교한다 — 사용자는 **arch 한 개** + **플러그인 N 개** 를 동시에 선택한다:

```bash
sh-ui create my-app \
  --platform next --structure standalone \
  --arch flat \
  --plugins sentry,next-intl,auth-jwt
```

플러그인은 arch 디스크립터의 논리 키 (`arch.paths.api`, `arch.aliases.layouts` 등) 를 조회해 자기 산출물의 fs 경로 / import 를 emit 한다. 플러그인 코드는 특정 arch 의 폴더명을 알지 못한다.

```
                ┌────────────────┐
                │ ArchManifest   │
                │  paths:    {…} │
                │  aliases:  {…} │
                └───────▲────────┘
                        │ (read-only)
        ┌───────────────┼───────────────┐
   ┌────┴────┐    ┌─────┴────┐    ┌─────┴─────┐
   │ sentry  │    │ next-intl │    │ auth-jwt  │
   └─────────┘    └──────────┘    └───────────┘
```

## 디스크립터 (`src/create/architectures/*.js`)

각 arch 는 다음 필드를 가진다:

| 필드 | 타입 | 의미 |
|---|---|---|
| `name` | `string` (kebab-case) | CLI/MCP 에서 사용할 식별자. 예: `"fsd"`, `"flat"` |
| `label` | `string` | 사람이 읽는 짧은 이름. 예: `"Feature-Sliced Design"` |
| `description` | `string` | 한 줄 설명. CLI `--help` 와 docs 에 노출. |
| `platforms` | `('next' \| 'flutter')[]` | 적용 가능한 플랫폼들. 호환되지 않는 조합은 generator 가 거부. |
| `paths` | `Record<ArchPathKey, string>` | 논리 키 → fs 경로 (앱 루트 상대). |
| `aliases` | `Record<ArchPathKey, string>` | 논리 키 → import alias prefix. |
| `tsconfigPaths` | `Record<string, string[]>` | tsconfig.json 의 paths 블록에 그대로 들어가는 객체. |

### 논리 키 (`ArchPathKey`)

모든 arch 가 노출해야 하는 8개 키:

| 키 | 의미 | FSD 예시 | Flat 예시 |
|---|---|---|---|
| `layouts` | RootLayout 등 라우트 레이아웃 | `src/app/layouts` | `components/layouts` |
| `providers` | GlobalProvider 등 컨텍스트 wrapper | `src/app/providers` | `components/providers` |
| `api` | HTTP fetch, BFF, observability | `src/shared/api` | `lib/api` |
| `config` | i18n 설정, 기타 환경 의존 | `src/shared/config` | `lib/config` |
| `hooks` | React 커스텀 훅 | `src/shared/hooks` | `lib/hooks` |
| `utils` | 순수 유틸 함수 (포맷팅 등) | `src/shared/lib` | `lib/utils` |
| `ui` | 공용 UI 부품 (FallbackBoundary 등) | `src/shared/ui` | `components/common` |
| `test` | 테스트 헬퍼 | `src/shared/test` | `lib/test` |

키 셋은 의도적으로 arch-중립적 — `shared/`, `slice` 같은 FSD 용어를 키 이름에 박지 않는다. 새 arch 가 키를 자기 폴더 컨벤션에 매핑할 자유가 보장되도록.

`paths` 와 `aliases` 는 1:1 대응이지만 **alias 가 fs 경로의 단순한 prefix 가 아닐 수 있다**. 예: flat 은 `paths.api = "lib/api"` 이고 `aliases.api = "@/lib/api"` — `@/` 가 카테고리별 scoped 이라 prefix-matching 만으로는 못 푼다. 그래서 두 필드를 별도로 둔다.

## 디스크립터 + 베이스 템플릿 의 관계

각 Next 베이스 템플릿 (`templates/nextjs-app`, `templates/nextjs-standalone`) 은 두 부분으로 나뉜다:

```
templates/nextjs-app/
├── (arch-neutral 파일들 — package.json, eslint.config.js, vitest.config.ts, …)
└── _arch/
    ├── fsd/      ← FSD 가 추가하는 파일들 (src/app, src/shared, app/layout.tsx, tsconfig.json)
    └── flat/     ← flat 이 추가하는 파일들 (lib, components, app/layout.tsx, tsconfig.json)
```

generator 의 `generateApp` / `generateStandalone` 는:

1. 베이스를 카피 (`_arch/` 디렉토리 자체는 filter 로 스킵)
2. 선택된 arch 의 오버레이를 위에 머지 (덮어쓰기 허용)

오버레이 안 의 파일들은 해당 arch 의 alias 컨벤션에 맞게 import 가 작성돼 있다. 같은 파일이 양쪽 오버레이에 모두 존재할 수 있다 (예: `app/layout.tsx` 는 alias 가 다르므로 양쪽에 따로 존재).

## 플러그인이 디스크립터를 소비하는 방법

플러그인의 `files` / `transforms` / `preExport` / `providerImports` 등 path-coupled 필드는 **함수형** 으로 정의한다:

```js
export const myPlugin = {
  name: 'my-plugin',
  // …
  files: (arch) => ({
    [`${arch.paths.api}/myHelper.ts`]: `import { foo } from '${arch.aliases.utils}/foo';\n…`,
  }),
  preExport: (arch) => [
    `const myThing = createMyThing('./${arch.paths.config}/my.ts');`,
  ],
};
```

generator 의 `resolveArchField(field, arch)` 헬퍼가 함수면 호출하고 정적 값이면 그대로 반환한다 — 플러그인 manifest 가 함수 / 정적 둘 다 유효하므로 점진적 마이그레이션 가능.

`imports` (next.config 의 import 문) 같이 arch-중립적인 필드는 그대로 정적 배열로 두면 된다.

## 새 arch 를 추가하는 절차

예: `clean` (Clean Architecture) 추가.

1. **디스크립터 작성** — `src/create/architectures/clean.js`
   - `paths`/`aliases` 8개 키 모두 매핑 (`infrastructure/api`, `presentation/components` 등)
   - `tsconfigPaths` 정의
   - `platforms: ['next']` (또는 flutter 도 지원하면 `['next', 'flutter']`)

2. **레지스트리 등록** — `src/create/architectures/index.js`
   ```js
   import { cleanArch } from './clean.js';
   export const allArchitectures = [fsdArch, flatArch, cleanArch];
   ```

3. **베이스 오버레이 작성** — `templates/nextjs-app/_arch/clean/`, `templates/nextjs-standalone/_arch/clean/`
   - FSD/flat 오버레이 한 쪽을 카피해서 시작 → 폴더 구조와 import 를 clean 컨벤션으로 조정
   - `tsconfig.json` 의 `paths` 가 디스크립터의 `tsconfigPaths` 와 일치
   - `app/layout.tsx` 가 디스크립터의 `aliases.layouts` 로 RootLayout import

4. **스모크 시나리오 추가** — `test/smoke.test.js` 의 `arch=clean 매트릭스` describe 블록
   - 핵심 산출물 위치 검증
   - `@/<old-arch>/...` import 가 누수되지 않는지 (회귀 가드)
   - 플러그인 조합 (sentry/next-intl/auth-jwt) 별 산출물 검증

5. **Marker 테스트 갱신** — `test/markers.test.js` 의 `TOKEN_FILES` 에 새 tokens.css 위치 추가 (standalone 의 경우)

6. **사용자 문서 추가** — `apps/docs/app/[locale]/(docs)/architectures/clean/page.tsx`
   - 폴더 구조 그림, alias 컨벤션, 어떤 프로젝트에 적합한지

7. **버전 범프** — minor (`vX.Y+1.0`). `packages/changelog/versions.json` 에 엔트리 prepend.

## 디자인 가드 — 자주 빠지는 함정

- **상대 경로 (`../../api/error`) 는 arch 가 바뀌면 깨질 수 있다.** 같은 슬라이스 내부 형제 (`./routing` 같은 짧은 상대) 는 안전. 하지만 슬라이스 경계를 넘는 import 는 alias (`arch.aliases.api`) 를 써야 함. sentry 의 FallbackBoundary 가 v0.58 에서 alias 로 통일된 사례.

- **arch 디스크립터 자체에 플러그인 이름이 들어가면 안 된다.** `paths.i18n` 은 잘못된 키 — 플러그인 specific. `paths.config` (i18n 은 그 아래 `i18n/` 서브폴더) 가 올바른 추상화.

- **`platforms` 배열은 generator 의 플랫폼 호환 검증에 직접 영향.** Next-only arch 에 `'flutter'` 를 잘못 넣으면 Flutter 사용자에게 깨진 경로가 떨어짐. 새 arch 추가 시 명시적으로 어느 플랫폼만 지원하는지 결정.

- **베이스 템플릿의 `_arch/<name>` 폴더가 누락되면 generator 가 ENOENT 로 죽는다.** 디스크립터를 만들었으면 베이스 오버레이도 반드시 같이 만들어야 한다. (또는 디스크립터의 platforms 에 next 를 넣지 말 것.)

## 참고 — Layer 1~3 도입 (v0.58.0)

이 시스템은 v0.58.0 에서 도입됐다. 그 전엔 모든 플러그인이 `src/shared/api/...` 같은 FSD 경로를 하드코딩하고 있어 다른 arch 를 추가하려면 플러그인을 분기해야 했다. 디스크립터 추상화 도입으로 플러그인은 한 번만 작성되고 모든 arch 에서 동작한다.

회귀 가드: FSD 디스크립터의 모든 `paths`/`aliases` 값은 v0.57 까지의 하드코딩과 1:1 일치하도록 설계됐다. 즉 v0.58 에서 FSD 사용자 입장 변화 0 이어야 한다 (`smoke.test.js` 의 `arch=fsd 회귀 가드` describe 가 보증).
