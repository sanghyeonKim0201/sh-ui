# sh-ui command palette — Phase 1 코어 설계 (cmdk 위 sh-ui)

- 작성일: 2026-06-19
- 대상 레포: sh-ui (registry React, apps/docs)
- 상태: 설계 승인 대기

## 배경

사용자 목표는 "Cmd+K 업데이트 & 자동화"이며, 세 갈래로 분해된다:
1. **배포용 command palette 컴포넌트** — 사용자 프로젝트가 쓰는 Cmd+K 팔레트(검색·명령 실행)를 sh-ui 컴포넌트로.
2. **docs 검색 개선** — 기존 `apps/docs/components/search-dialog.tsx`(MiniSearch)를 새 컴포넌트로 dogfooding.
3. **인덱스/액션 자동화** — 검색 인덱스 자동 생성 개선 + 명령/액션 자동 등록.

이 셋은 **연결된 단계**다: ①컴포넌트가 기반, ②docs 가 그걸 dogfooding, ③그 위에 자동화. 따라서 **코어(①)부터 단계적으로** 쌓는다.

command palette 의 핵심(fuzzy 검색·필터·키보드 네비·접근성)을 자체 구현하면 재발명이라, Table 의 TanStack 처럼 **검증된 headless 엔진 `cmdk` 위에 sh-ui presentational 레이어**를 얹는다(shadcn 의 command 가 정확히 이 모델). 대상 플랫폼은 **React 먼저** — cmdk 는 React 전용. Flutter 는 별도 엔진/별도 spec.

이 문서는 **Phase 1 코어**만 다룬다.

## 목표 (Phase 1 코어)

- `cmdk` 위 sh-ui `command` 프리미티브 컴포넌트(3 CSS 변종)
- `CommandDialog`(sh-ui dialog + Command)로 Cmd+K 팝업
- 동작하는 docs 데모(Cmd+K 단축키 + 그룹/아이템 검색)
- 듀얼 카피본 + docs 페이지

## 비목표 (후속 phase)

- docs `search-dialog` 교체(dogfooding) + MiniSearch 인덱스 연동 — Phase 2.
- 액션 자동 등록(컴포넌트/페이지 → 팔레트 액션) + 인덱스 자동화 — Phase 3.
- Flutter command palette — 별도 엔진, 별도 spec.

## 아키텍처 / 컴포넌트 모델

**shadcn command 모델과 동일:** `cmdk`(headless — 검색 필터·키보드 네비·role/aria) 위에 sh-ui 토큰 스타일. `CommandDialog` 는 sh-ui 의 기존 `dialog` 컴포넌트(Base UI 기반, registry 에 존재) + `Command` 조합.

### 컴포넌트 `command` (cmdk 래핑 + sh-ui 스타일)

| 컴포넌트 | 래핑 | 역할 |
|---|---|---|
| `Command` | `cmdk` Command | 루트(검색 컨텍스트) |
| `CommandDialog` | sh-ui Dialog + Command | Cmd+K 팝업 |
| `CommandInput` | `cmdk` Command.Input | 검색 입력(필터 트리거) |
| `CommandList` | `cmdk` Command.List | 결과 리스트 |
| `CommandEmpty` | `cmdk` Command.Empty | 빈 결과 메시지 |
| `CommandGroup` | `cmdk` Command.Group | 그룹(heading) |
| `CommandItem` | `cmdk` Command.Item | 항목(onSelect, 키보드 하이라이트) |
| `CommandSeparator` | `cmdk` Command.Separator | 구분선 |
| `CommandShortcut` | `<span>` | ⌘K 같은 단축키 표시(우측 정렬) |

- 모두 `React.forwardRef`, `cn`(`@SH_UI_UTILS@`), BEM `sh-ui-command*`.
- 검색·필터·키보드·a11y(role=combobox/listbox/option, aria-selected, ↑↓/Enter)는 **cmdk 가 제공** — sh-ui 는 스타일만.
- `CommandDialog` 는 포커스 트랩·Esc·오버레이를 sh-ui `dialog`(Base UI)에 위임.

### Phase 1 데모 (docs)

```tsx
// Cmd+K 로 CommandDialog 열기 (useEffect keydown: metaKey/ctrlKey + 'k')
const [open, setOpen] = useState(false);
// <CommandDialog open={open} onOpenChange={setOpen}>
//   <CommandInput placeholder="명령 검색…" />
//   <CommandList>
//     <CommandEmpty>결과 없음</CommandEmpty>
//     <CommandGroup heading="페이지">
//       <CommandItem onSelect={...}>컴포넌트 <CommandShortcut>⌘C</CommandShortcut></CommandItem>
//     </CommandGroup>
//     <CommandSeparator />
//     <CommandGroup heading="액션">...</CommandGroup>
//   </CommandList>
// </CommandDialog>
```

아이템·액션·검색 데이터는 사용자가 제공(headless). cmdk 가 입력값으로 자동 필터.

## 스타일 (토큰 변수)

- `command`: 배경 `var(--popover|--background)`, radius `var(--radius)`, 텍스트 `var(--foreground)`.
- `command__input`: 높이 `var(--control-md)`, 하단 border, padding `var(--space-3)`, placeholder `var(--foreground-muted)`.
- `command__item`: padding `var(--space-2) var(--space-3)`, radius, `cursor: pointer`. 하이라이트(`[data-selected="true"]`/`[aria-selected="true"]`) 배경 `var(--background-muted)`. disabled `var(--foreground-muted)`.
- `command__group-heading`: `var(--text-xs)`, `var(--foreground-muted)`, padding.
- `command__shortcut`: 우측 정렬, `var(--text-xs)`, `var(--foreground-muted)`.
- `command__separator`: 1px `var(--border)`.
- reduced-motion 준수.

(정확한 셀렉터/매직값은 accordion 관행 따라 토큰 경유. CommandDialog 의 오버레이/애니메이션은 dialog 컴포넌트 스타일 재사용.)

## 파일 구조 (듀얼 카피본 + 3 변종, Tree·Table 과 동일 인프라)

- `packages/registry/react/components/command/` — `index.tsx`(plain) + `index.tailwind.tsx` + `index.module.tsx` + `styles.css` + `styles.module.css`
- `apps/docs/components/ui/command/` — 복사본(로컬 `cx`)
- `apps/docs/app/[locale]/(docs)/components/command/page.tsx` + `_demos/command-palette.tsx`
- `apps/docs/package.json` — `cmdk` 추가
- `packages/registry/react/registry.json` — `command` 엔트리(deps `["cmdk"]`, registryDependencies `["utils","dialog"]`)
- `apps/docs/components/app-sidebar.tsx` + 인덱스 그리드 등록(예: "Feedback & Overlay" 또는 "Navigation")

## 테스트

vitest + @testing-library/react — command 컴포넌트:
- `Command` + `CommandInput` + `CommandItem` 렌더, 입력 시 필터(매칭 아이템만 표시)
- `CommandItem` onSelect 호출(클릭/Enter)
- `CommandEmpty` 빈 결과 표시
- `CommandGroup` heading 렌더
- (CommandDialog 의 Cmd+K 토글은 docs 데모/빌드로 검증)

> cmdk 의 내부 필터/키보드는 cmdk 자체 테스트 영역 — sh-ui 테스트는 래핑/스타일/onSelect wiring 에 집중.

## 릴리즈

- 신규 컴포넌트 → **MINOR**.
- ⚠️ **`packages/cli/package.json` + `packages/changelog/versions.json` 둘 다 동기화**(v0.117.0 publish 실패 학습 — registry npm 번들이라 cli bump 필수).
- `packages/llms/summaries/react.json` 에 `command` summary 추가(lint:drift — v0.118.0 에서 누락해 CI red 났던 학습).
- dev → live PR → live 태그(레포 정책)는 구현 완료 후 사용자 확인.

## 백로그 (후속 phase, 각 별도 spec)

- **Phase 2 — docs dogfooding**: `apps/docs/components/search-dialog.tsx` 를 `CommandDialog` 기반으로 교체, 기존 MiniSearch 인덱스(`/search-index.json`)를 CommandItem 으로 연결. docs 검색 UX 개선.
- **Phase 3 — 액션/인덱스 자동화**: 컴포넌트·페이지·CLI 명령을 팔레트 액션으로 자동 등록(레지스트리 기반 generate), 검색 인덱스 자동 생성 개선. (agent-native 액션 노출 검토)
- **Flutter command palette** — 별도 엔진, 별도 spec.
