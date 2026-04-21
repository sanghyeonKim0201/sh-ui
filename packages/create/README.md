# @sh-ui/create

프로젝트 생성 CLI + 템플릿 모음. sh-ui 기반 스캐폴드.

> sh-ui 모노레포의 `packages/create/` 에 포함된 내부 패키지. 공개 릴리즈 시
> `npx sh-ui-create` 로 호출.

---

## CLI 명령어 요약

| 명령어 | 설명 | 실행 위치 |
|---|---|---|
| `npx sh-ui-create` | 새 프로젝트 생성 (단독 / 모노레포) | 프로젝트를 만들 디렉토리 |
| `npx sh-ui-create add-app` | 모노레포에 앱 추가 | 모노레포 루트 |
| `npx sh-ui-create add-component <name>` | sh-ui 컴포넌트 추가 | 프로젝트 루트 |
| `npx sh-ui-create add-component <name> --app <app>` | 특정 앱에만 컴포넌트 추가 | 모노레포 루트 |

`add-component` 는 내부적으로 `npx sh-ui add <name>` 을 위임 호출한다.

---

## 1. 새 프로젝트 생성

프로젝트를 만들고 싶은 디렉토리에서 실행:

```bash
cd ~/development
npx sh-ui-create
```

```
? 프로젝트 이름: my-app
? 프로젝트 구조: (단독 / 모노레포)
? 추가 기능 선택: (Sentry, next-intl)
```

### 단독 선택 시

sh-ui 설정(`sh-ui.config.json`)이 포함된 독립 Next.js 프로젝트가 생성됩니다.

```
my-app/
├── app/                    # Next.js 라우트
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css         # sh-ui tokens.css import
├── src/                    # FSD 구조
│   ├── app/                # providers, layouts
│   ├── shared/
│   │   ├── ui/             # ← sh-ui 컴포넌트가 여기로 복사됨
│   │   ├── lib/utils.ts    # cn() 등
│   │   ├── styles/tokens.css  # sh-ui 토큰
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── config/
│   │   └── model/
│   ├── entities/
│   ├── features/
│   ├── views/
│   └── widgets/
├── sh-ui.config.json       # sh-ui 설정 (platform, theme, paths)
├── next.config.ts
└── ...
```

### 모노레포 선택 시

Turborepo + pnpm 워크스페이스가 생성되고, 첫 번째 앱까지 추가됩니다.

```
my-project/
├── apps/
│   └── web/                # 첫 번째 Next.js 앱
├── packages/
│   ├── ui/
│   │   ├── ui-core/        # 공통 유틸 (cn 등)
│   │   └── ui-apps/
│   │       └── ui-web/     # web 전용 sh-ui 패키지 (독립 테마)
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json
└── pnpm-workspace.yaml
```

각 `ui-{app}/` 패키지는 자체 `sh-ui.config.json` 을 가져 앱별로 다른 테마를
유지할 수 있습니다.

---

## 2. 모노레포에 앱 추가

```bash
cd my-project
npx sh-ui-create add-app
```

```
? 앱 이름: admin
? 포트 번호: 3001
? 추가 기능 선택: (Sentry, next-intl)
```

자동으로 생성되는 것:

- `apps/admin/` — Next.js 앱 (FSD 구조)
- `packages/ui/ui-apps/ui-admin/` — admin 전용 sh-ui 패키지 (독립 `sh-ui.config.json`)

---

## 3. sh-ui 컴포넌트 추가

### 단독 프로젝트

```bash
cd my-app
npx sh-ui-create add-component button
```

`src/shared/ui/` 에 컴포넌트가 생성됩니다. 내부적으로 `npx sh-ui add button` 이
호출되며, `sh-ui.config.json` 의 `paths.components` 를 참조합니다.

### 모노레포

```bash
cd my-project

# 대화형: 어디에 추가할지 선택
npx sh-ui-create add-component button

# 모든 ui 패키지에 추가
# → 선택지에서 "모든 ui 패키지" 선택

# 특정 앱에만 추가
npx sh-ui-create add-component button --app web
```

`packages/ui/ui-apps/ui-{app}/src/components/` 에 컴포넌트가 생성됩니다.

---

## UI 패키지 구조 (모노레포)

```
packages/
├── ui/
│   ├── ui-core/            # 기능/로직 공유 (스타일 없음)
│   │   └── src/lib/utils.ts    # cn(), 공통 유틸
│   │
│   └── ui-apps/
│       ├── ui-web/         # web 앱 전용 (독립 테마)
│       │   ├── sh-ui.config.json  # 앱별 테마 설정
│       │   └── src/
│       │       ├── components/    # sh-ui 컴포넌트
│       │       ├── hooks/
│       │       └── styles/
│       │           ├── globals.css  # 테마 변수
│       │           └── tokens.css   # sh-ui 토큰
│       │
│       └── ui-admin/       # admin 앱 전용 (독립 테마)
│           ├── sh-ui.config.json
│           └── src/
│               ├── components/
│               ├── hooks/
│               └── styles/
│                   ├── globals.css
│                   └── tokens.css
```

**핵심 원리:**
- `ui-core` — 기능(로직)을 한 곳에서 관리. 수정하면 모든 앱에 반영.
- `ui-{app}` — 스타일/테마를 앱별로 독립 관리. 각자 다른 `sh-ui.config.json`.

---

## FSD 폴더 구조

모든 앱(단독/모노레포)은 Feature-Sliced Design 구조를 따릅니다:

```
src/
├── app/                # 앱 레벨 (providers, layouts, guards)
├── views/              # 페이지 단위 뷰
├── widgets/            # 조합형 UI 블록
├── features/           # 기능 단위
├── entities/           # 비즈니스 엔티티
└── shared/             # 공유 (api, lib, hooks, ui, config, model)
```

레이어 import 규칙 (ESLint `boundaries` 플러그인으로 강제):

```
app → view → widget → feature → entity → shared
```

상위 레이어는 하위 레이어만 import 가능.

---

## 플러그인

### Sentry (에러 모니터링)

선택 시 자동 셋팅:

| 파일 | 역할 |
|---|---|
| `sentry.server.config.ts` | 서버 런타임 초기화 + beforeSend 필터링 |
| `sentry.edge.config.ts` | Edge 런타임 초기화 |
| `instrumentation.ts` | 런타임별 Sentry 로드 + 요청 에러 캡처 |
| `instrumentation-client.ts` | 클라이언트 Sentry (Replay, 브라우저 에러 필터) |
| `app/error.tsx` | 라우트 에러 바운더리 |
| `app/global-error.tsx` | 글로벌 에러 바운더리 |
| `src/shared/ui/FallbackBoundary/` | 컴포넌트 레벨 에러 바운더리 (React Query 통합) |
| `src/shared/api/` | ApiError 클래스, Axios 인터셉터, `captureApiError()` |
| `app/api/proxy/[...path]/route.ts` | API 프록시 (5xx 에러 Sentry 보고) |
| `src/shared/hooks/useAppMutation.ts` | 뮤테이션 훅 (에러 토스트 자동 표시) |

에러 수집 흐름:

- **클라이언트 API** → `api/proxy` route에서 `captureApiError()` (5xx만)
- **서버 API** → `http.ts` 인터셉터에서 `captureApiError()` (5xx만)
- **UI 에러** → `error.tsx`, `FallbackBoundary`에서 `Sentry.captureException()`
- 중복 방지: `beforeSend` 필터 + `instrumentation`에서 ApiError/AxiosError 차단

### next-intl (다국어)

선택 시 자동 셋팅:

| 파일 | 역할 |
|---|---|
| `app/[locale]/layout.tsx` | 로케일별 레이아웃 |
| `app/[locale]/page.tsx` | 기존 page.tsx 자동 이동 |
| `proxy.ts` | 로케일 라우팅 미들웨어 |
| `src/shared/config/i18n/routing.ts` | 로케일 정의 (ko, en) |
| `src/shared/config/i18n/request.ts` | 서버 요청 시 로케일 결정 |
| `src/shared/config/i18n/navigation.ts` | 로케일 인식 Link, useRouter 등 |
| `src/shared/config/i18n/messages/` | ko.json, en.json 기본 메시지 |
| `GlobalProvider` | `NextIntlClientProvider` 자동 래핑 |

둘 다 선택하면 `next.config.ts`가 자동으로 합쳐집니다:

```ts
export default withSentryConfig(withNextIntl(nextConfig), { ... });
```

---

## 플러그인 추가 방법

`src/plugins/`에 새 파일 생성 후 `src/plugins/index.js`에 등록:

```js
export const myPlugin = {
  name: 'my-plugin',
  label: 'My Plugin (설명)',
  priority: 3,                    // 적용 순서

  dependencies: {},               // package.json에 추가할 의존성
  imports: [],                    // next.config.ts import 문
  wrapExport(expr) {},            // next.config.ts export 래핑

  providerImports: [],            // GlobalProvider에 추가할 import
  providerWrappers: [],           // GlobalProvider에 래핑할 컴포넌트

  envVars: [],                    // .env.example에 추가
  turboEnvVars: [],               // turbo.json globalEnv에 추가

  files: {},                      // 생성할 파일들
  transforms: [],                 // 파일 이동/교체 (move, replace, delete)
};
```
