# sh-ui dataTable — Phase 1 코어 설계 (table primitives + TanStack 통합)

- 작성일: 2026-06-18
- 대상 레포: sh-ui (registry React, apps/docs)
- 상태: 설계 승인 대기

## 배경

sh-ui 에 데이터 테이블이 없다. 사용자 목표는 **기능이 풍부한 데이터 그리드**(정렬·필터·셀 필터·그룹화·열 고정·행/열 드래그앤드롭)이면서 **자유로운 커스터마이징**이 가능한 것.

이 기능들을 자체 구현하면 데이터 그리드 엔진을 재발명(수개월·버그 위험)하는 것이라, 업계 표준이자 sh-ui 철학과 맞는 방식 — **검증된 headless 엔진(TanStack Table) 위에 sh-ui presentational 레이어** — 을 택한다. sh-ui 가 이미 "Base UI(headless) 위에 스타일"을 얹는 것과 동일 패턴이고, shadcn 의 data-table 가 정확히 이 모델이다. 헤드리스라 커스터마이징도 자유롭다.

풀 기능 × 한 spec 은 불가능하므로 **코어부터 단계적으로** 쌓는다(각 phase 가 동작·출시 가능). 대상 플랫폼은 **React 먼저** — TanStack Table 은 React(JS) 생태계 엔진이고, Flutter 는 TanStack 이 없어 별도 엔진이 필요한 거의 별개 프로젝트이므로 React API·UX 확정 후 후속한다.

이 문서는 **Phase 1 코어**만 다룬다.

## 목표 (Phase 1 코어)

- **presentational `table` 프리미티브** 컴포넌트(네이티브 `<table>` + sh-ui 스타일, 의존성 0)
- TanStack Table 과 조립해 **정렬 + 행 선택 + 페이지네이션**이 동작하는 데이터 테이블 docs 예제
- React 3 CSS 변종(plain·tailwind·css-modules) + 듀얼 카피본 + docs 페이지

## 비목표 (후속 phase)

- 필터·셀 필터, 열 고정·리사이즈, 그룹화·확장, 행/열 DnD — 각각 별도 spec.
- Flutter dataTable — 별도 엔진, 별도 spec.
- 가상 스크롤(대용량) — 필요성 확인 후 별도 검토.

## 아키텍처 / 컴포넌트 모델

**shadcn data-table 모델과 동일:** sh-ui 는 presentational `table` 프리미티브만 제공하고, 정렬·선택·페이지네이션 로직은 사용자가 TanStack Table 로 wiring 한다(docs 에 동작 예제). 이게 "자유 커스터마이징"의 핵심 — sh-ui 는 마크업/스타일만, 로직은 헤드리스 엔진 + 사용자 코드.

### 컴포넌트 `table` (presentational primitives)

| 컴포넌트 | 요소 | 역할 |
|---|---|---|
| `Table` | `<div class=wrapper>` + `<table>` | 가로 스크롤 래퍼 + 테이블, `width:100%` |
| `TableHeader` | `<thead>` | 헤더 그룹 |
| `TableBody` | `<tbody>` | 본문 |
| `TableFooter` | `<tfoot>` | 합계/요약(선택) |
| `TableRow` | `<tr>` | hover 배경 + `data-state="selected"` |
| `TableHead` | `<th scope="col">` | 헤더 셀(정렬 토글/인디케이터 슬롯) |
| `TableCell` | `<td>` | 본문 셀 |
| `TableCaption` | `<caption>` | 접근성 캡션 |

- 모두 `React.forwardRef`, `cn`(`@SH_UI_UTILS@`), BEM `sh-ui-table*`.
- 네이티브 `<table>` 시맨틱이 a11y 기본 제공. Base UI 불필요. **컴포넌트 자체 의존성 0** — TanStack 은 사용자가 데이터 테이블을 조립할 때 추가하는 peer.

### Phase 1 데모 (docs, TanStack 통합)

```tsx
const table = useReactTable({
  data, columns,                                  // ColumnDef[]
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),          // 정렬
  getPaginationRowModel: getPaginationRowModel(),  // 페이지네이션
  onSortingChange: setSorting,
  onRowSelectionChange: setRowSelection,
  state: { sorting, rowSelection },
});
// <Table> primitives + flexRender 로 렌더.
// TableHead: 정렬 가능 컬럼은 <button> + aria-sort(ascending|descending|none) + 인디케이터.
// 선택 컬럼: 기존 checkbox 컴포넌트(헤더=전체선택, 행=개별).
// 하단: 기존 pagination 컴포넌트로 page 이동.
```

사용자는 이 예제를 복사 → 정렬·선택·페이지 동작 + 컬럼/셀 렌더 100% 자유.

## 스타일 (토큰 변수)

```css
.sh-ui-table__wrapper { width: 100%; overflow-x: auto; }
.sh-ui-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.sh-ui-table__head {
  height: var(--control-md); padding: 0 var(--space-3);
  text-align: start; font-weight: var(--weight-medium);
  color: var(--foreground-muted); vertical-align: middle;
}
.sh-ui-table__cell { padding: var(--space-3); vertical-align: middle; }
.sh-ui-table__row { border-bottom: 1px solid var(--border); transition: background-color var(--duration-fast) var(--ease-standard); }
.sh-ui-table__row:hover { background: var(--background-muted); }
.sh-ui-table__row[data-state="selected"] { background: var(--background-muted); }
.sh-ui-table__caption { margin-top: var(--space-3); color: var(--foreground-muted); font-size: var(--text-xs); }
@media (prefers-reduced-motion: reduce) { .sh-ui-table__row { transition: none; } }
```

## a11y

- 네이티브 `<table>` 시맨틱(스크린리더 행/열 탐색) + `<th scope="col">`.
- 정렬 헤더: `<button>` + `aria-sort`(ascending/descending/none) — 데모에서 wiring.

## 파일 구조 (듀얼 카피본 + 3 변종, Tree 와 동일 인프라)

- `packages/registry/react/components/table/` — `index.tsx`(plain) + `index.tailwind.tsx` + `index.module.tsx` + `styles.css` + `styles.module.css`
- `apps/docs/components/ui/table/` — 복사본(로컬 `cx`)
- `apps/docs/app/[locale]/(docs)/components/table/page.tsx` + `_demos/data-table.tsx`(TanStack 예제)
- `apps/docs/package.json` — `@tanstack/react-table` 추가(데모 렌더용)
- `packages/registry/react/registry.json` — `table` 엔트리(deps `[]`, registryDependencies `["utils"]`)
- `apps/docs/components/app-sidebar.tsx` + `apps/docs/app/[locale]/(docs)/components/page.tsx` — 등록("Display" 그룹)

## 테스트

vitest + @testing-library/react — table primitives:
- `Table` → `<table>` 렌더(가로 스크롤 래퍼 포함)
- `TableRow data-state="selected"` 반영
- `TableHead` → `<th scope="col">`
- 서브컴포넌트 합성 + className 머지(`cn`)
- (TanStack 데모는 docs 빌드로 검증)

## 릴리즈

- 신규 컴포넌트 → **MINOR**.
- ⚠️ **`packages/cli/package.json` version 을 태그와 동기화**(v0.117.0 publish 실패 학습: registry 가 sh-ui-cli npm 패키지에 번들되므로 컴포넌트-only 릴리즈도 cli version bump 필수 — `docs/solutions/workflow-issues/component-release-requires-cli-version-bump-2026-06-18.md`).
- `packages/changelog/versions.json` 엔트리 prepend.
- dev → live PR → live 태그(레포 정책)는 구현 완료 후 사용자 확인.

## 백로그 (후속 phase, 각 별도 spec)

- **Phase 2 — 필터**: 글로벌 필터 + 컬럼 필터(`getFilteredRowModel`), 셀 단위 필터 UI.
- **Phase 3 — 열 고정·리사이즈**: column pinning(좌우 고정) + column sizing(드래그 리사이즈).
- **Phase 4 — 그룹화·확장**: `getGroupedRowModel` + `getExpandedRowModel`, 하위 행 펼침.
- **Phase 5 — DnD**: 행/열 드래그앤드롭 재정렬(`@dnd-kit`).
- **Flutter dataTable** — 별도 엔진(예: pluto_grid 또는 자체), 별도 spec.
