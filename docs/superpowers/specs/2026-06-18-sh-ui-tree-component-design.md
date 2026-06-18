# sh-ui Tree 컴포넌트 — Phase 1 코어 설계

- 작성일: 2026-06-18
- 대상 레포: sh-ui (registry React + Flutter, apps/docs)
- 상태: 설계 승인 대기

## 배경

sh-ui 에 계층 데이터를 표시·탐색하는 **Tree 컴포넌트**가 없다. 사용자 로드맵은 풀 기능
(확장/선택 + 다중선택 + 드래그앤드롭 재정렬 + 비동기 lazy 로드 + 인라인 편집)을 목표로 하되,
풀 기능 × 듀얼 플랫폼을 한 번에 만들면 작업량·복잡도·리뷰 부담이 과도하고 중간 산출물이 늦다.
따라서 **코어부터 단계적으로** 쌓는다. 각 단계는 그 자체로 동작·출시 가능한 컴포넌트다.

이 문서는 **Phase 1 코어**만 다룬다 — 확장/축소, 단일 선택, 키보드 네비게이션, 접근성.
React + Flutter 동시. 후속 phase는 마지막 "백로그" 절에 기록한다.

## 목표 (Phase 1 코어)

- 데이터 주도 API 로 계층 노드를 재귀 렌더
- 노드 확장/축소 (제어·비제어)
- 단일 선택 (제어·비제어)
- WAI-ARIA Tree View 패턴 + 키보드 네비게이션
- React/Flutter 양쪽 구현 + docs 듀얼 탭

## 비목표 (후속 phase)

- 다중 선택(체크박스), 드래그앤드롭 재정렬, 비동기 lazy 로드, 인라인 편집 — 각각 별도 spec.
- 가상 스크롤(대규모 노드 성능) — 필요성 확인 후 별도 검토.

## API 설계

### 노드 모델 (플랫폼 공통 개념)

```ts
interface TreeNode {
  id: string;            // 안정적 고유 id — 키보드 네비·선택·후속 DnD 의 기준
  label: React.ReactNode; // 표시 라벨
  children?: TreeNode[];  // 없으면 잎(leaf) 노드
  icon?: React.ReactNode; // 선택적 아이콘 슬롯
  disabled?: boolean;     // 포커스 스킵·선택 불가
}
```

### React API (제어/비제어 모두 지원 — sh-ui 관행)

```tsx
interface TreeProps {
  nodes: TreeNode[];

  // 확장 상태
  expandedIds?: string[];            // 제어
  defaultExpandedIds?: string[];     // 비제어 초기값
  onExpandedChange?: (ids: string[]) => void;

  // 선택 (코어는 단일 선택)
  selectedId?: string | null;        // 제어
  defaultSelectedId?: string | null; // 비제어 초기값
  onSelect?: (id: string | null) => void;

  renderLabel?: (node: TreeNode) => React.ReactNode; // 커스텀 렌더 슬롯
  size?: "sm" | "md";                                // 기본 "md"
}
```

상태(expanded/selected)는 제어/비제어 둘 다 열어둬 **headless 를 유지**한다 — 데이터 주도여도
상태 소유권은 사용자에게 있다. `id` 기반이라 후속 phase(DnD·lazy·편집)가 같은 모델 위에 얹힌다.

### Flutter API (동일 개념, Dart 관용)

```dart
ShUiTree(
  nodes: List<ShUiTreeNode>,
  expandedIds: Set<String>?,          // 제어
  onExpandedChange: (Set<String>)?,
  selectedId: String?,                // 제어
  onSelect: (String?)?,
  size: ShUiTreeSize = ShUiTreeSize.md,
)
// ShUiTreeNode(id:, label:, children:, icon:, disabled:)
```

## a11y & 키보드

### ARIA (WAI-ARIA Tree View 패턴)

- 컨테이너 `role="tree"`, 노드 `role="treeitem"`, 자식 묶음 `role="group"`
- `aria-expanded`(부모), `aria-selected`(선택), `aria-level`·`aria-setsize`·`aria-posinset`, `aria-disabled`
- **roving tabindex** — 트리 전체가 탭 스톱 1개. 포커스된 treeitem 만 `tabIndex=0`, 나머지 `-1`

### 키보드 (가시 노드 평탄화 기준)

| 키 | 동작 |
|---|---|
| ↑ / ↓ | 이전/다음 가시 노드로 포커스 이동 |
| → | 닫힌 부모면 확장, 열린 부모면 첫 자식으로, 잎이면 무동작 |
| ← | 열린 부모면 축소, 그 외엔 부모로 이동 |
| Home / End | 첫 / 마지막 가시 노드 |
| Enter / Space | 포커스 노드 선택(`onSelect`) |
| 글자 입력(typeahead) | 라벨 접두사로 가시 노드 점프 |

`disabled` 노드는 포커스 스킵·선택 불가.

### Flutter

`FocusableActionDetector` + `Shortcuts`/`Actions` 로 동일 키맵을 매핑, `Semantics`(expanded/selected/label)
로 스크린리더 대응. 데스크톱·웹은 키보드, 모바일은 탭/제스처.

## 아키텍처 / 구현

핵심은 **"현재 펼쳐진 상태 기준 가시 노드 1차원 배열"로 평탄화**한 뒤 그 인덱스로 키보드 네비를
처리하는 것. 재귀 DOM 탐색보다 단순하고 테스트하기 쉽다.

- `flatten(nodes, expandedIds)` → `{ id, level, parentId, hasChildren, disabled }[]` (가시 노드만, 순수 함수)
- 렌더 컴포넌트는 재귀로 treeitem/group 을 그리되, 키보드 이동·포커스 계산은 평탄화 배열로.
- `flatten` 과 키보드 핸들러(다음/이전/확장/축소 결정) 로직을 렌더에서 분리 — 순수 함수라 독립 단위 테스트.

Base UI 에 tree primitive 가 없으면 자체 `div` + role 로 구현한다. 노드 확장 영역에 Base UI
`Collapsible` 활용 여부는 구현 시 결정(애니메이션이 필요하면 활용, 아니면 단순 조건부 렌더).

## 파일 구조 (듀얼 카피본 + 듀얼 플랫폼)

React (레지스트리 원본 → docs 복사본 동기화):
- `packages/registry/react/components/tree/` — `index.tsx`(plain) + `index.tailwind.tsx` + `index.module.tsx`,
  `styles.css` / `styles.module.css`, `flatten.ts`(순수 함수), `types.ts`
- `apps/docs/components/ui/tree/` — 동일 복사본
- `packages/registry/react/registry.json` — `tree` 엔트리
  (registryDependencies: 필요 시 `utils`. 외부 의존성: Base UI Collapsible 활용 시 `@base-ui-components/react`)

Flutter:
- `packages/registry/flutter/widgets/sh_ui_tree.dart` ↔ `apps/showcase/lib/widgets/` 복사본
- `packages/registry/flutter/registry.json` 엔트리

문서:
- `apps/docs/app/[locale]/(docs)/components/tree/page.tsx` — React/Flutter `<CodeTabs>` 양쪽, props 표,
  라이브 데모
- `apps/docs/components/app-sidebar.tsx` 컴포넌트 목록 + 검색 인덱스에 `tree` 등록

## 테스트

React (vitest + testing-library):
- 확장/축소 토글 (제어·비제어)
- 단일 선택 (제어·비제어, `onSelect` 호출)
- 키보드: ↑↓ 이동, → 확장/자식, ← 축소/부모, Home/End, Enter/Space 선택, typeahead
- `disabled` 노드 포커스 스킵·선택 불가
- ARIA roles/속성(`role`, `aria-expanded`, `aria-selected`, `aria-level`)
- `flatten` 순수 함수 단위 테스트 (가시 노드 계산)

Flutter (widget test):
- 확장/선택 동작, 키맵, `Semantics`(expanded/selected/label)

## 릴리즈

- 신규 컴포넌트 → **MINOR**.
- `packages/changelog/versions.json` 에 엔트리 prepend (highlights 3~4줄).
- dev → live PR → live 태그 순서(레포 정책)는 구현 완료 후 사용자 확인.

## 백로그 (후속 phase, 각 별도 spec)

- **Phase 2 — 다중 선택**: 부모/자식 연동 체크박스(indeterminate 상태 포함). `selectedIds`/`onSelectionChange`.
- **Phase 3 — 드래그앤드롭 재정렬**: 노드 id 기반 이동, drop 위치(before/after/inside) 판정, `onMove`.
- **Phase 4 — 비동기 lazy 로드**: `loadChildren(node)` 콜백, 로딩 상태 표시, 펼칠 때 자식 fetch.
- **Phase 5 — 인라인 편집**: 라벨 rename(더블클릭/F2), `onRename`, 편집 중 키보드 가드.
- (검토) 가상 스크롤 — 대규모 노드 성능 필요 시.
