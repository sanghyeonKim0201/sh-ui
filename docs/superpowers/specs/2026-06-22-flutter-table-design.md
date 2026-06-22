# Flutter ShUiTable — 정렬 내장 데이터 테이블 위젯 설계

- 작성일: 2026-06-22
- 대상 레포: sh-ui (Flutter registry + showcase)
- 상태: 설계 승인됨 → 플랜 작성 단계

## 배경

React 쪽 `table`(presentational primitives + TanStack docs 데모)은 v0.118.0 에 배포됐고, 이후 docs 에 TanStack 전 기능 데모를 추가했다. Flutter 쪽엔 아직 table 위젯이 없다. Flutter 엔 TanStack 이 없으므로, 자체 내장 정렬을 갖춘 presentational 데이터 테이블 `ShUiTable<T>` 을 추가해 플랫폼 패리티를 맞춘다. Tree 위젯 선례(위젯 + registry.json + flutter.json 요약, showcase 페이지 없음)와 동일 범위.

## 목표

- `ShUiTable<T>` — 컬럼 정의 + 행 데이터로 themed 테이블 렌더, **헤더 탭 정렬(▲/▼)** 내장.
- sh-ui 토큰 테마(헤더·보더·행 hover/zebra·밀도), Semantics(스크린리더).
- CLI 배포 아티팩트(registry.json) + LLM 요약(flutter.json).

## 비목표

- showcase 데모 페이지 — Tree 선례대로 이번엔 추가 안 함(위젯·요약만). (후속 가능)
- 필터/그룹화/페이지네이션/가상화 — 이번 범위 아님(정렬만 내장). 페이지네이션은 기존 `ShUiPagination` 과 조합.
- React 쪽 변경 — 없음.

## 설계

### 타입

```dart
enum ShUiTableSize { sm, md }            // 밀도(행 높이·폰트)
enum ShUiSortDirection { ascending, descending }

class ShUiTableColumn<T> {
  final String id;                        // 정렬 상태 추적 키
  final String header;                    // 헤더 라벨
  final String Function(T row) cell;      // 셀 표시 텍스트
  final Comparable Function(T row)? sortKey; // 있으면 정렬 가능 컬럼
  final TextAlign align;                  // 기본 start
}
```

### 위젯

```dart
class ShUiTable<T> extends StatefulWidget {
  final List<ShUiTableColumn<T>> columns;
  final List<T> rows;
  final ShUiTableSize size;     // 기본 md
  final bool zebra;             // 기본 false — 홀짝 행 배경
  final String? caption;        // 표 캡션(선택)
  final String? initialSortColumnId;
  final ShUiSortDirection initialSortDirection;
}
```

- **정렬 상태(내부):** `_sortId`, `_sortDir`. 정렬 가능 헤더 탭 → 같은 컬럼이면 asc↔desc 토글, 다른 컬럼이면 그 컬럼 asc 로. `sortKey` 없는 컬럼은 탭 불가.
- **렌더:** `_sortedRows` = sortKey 로 정렬한 행 복사본(정렬 미설정 시 원본 순서). 헤더 row(정렬 컬럼에 ▲/▼ + `Semantics(sortKey)`), body rows(zebra/hover), 토큰 패딩(밀도별).
- **테마:** `Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light` — colors(background/backgroundMuted/foreground/foregroundMuted/border), spacing(s2/s3/s4), text(sm/xs), weight(medium/regular), borderWidth(normal), radius. Tree 위젯과 동일 접근.
- **접근성:** 헤더 정렬 버튼 `Semantics(button, label)`, 정렬 상태 라벨. 행/셀 텍스트 기본 Semantics.

### 파일 (Tree 선례 동일)

1. `packages/registry/flutter/widgets/sh_ui_table.dart` (원본)
2. `apps/showcase/lib/widgets/sh_ui_table.dart` (듀얼 카피 — 동일 내용)
3. `packages/registry/flutter/registry.json` — `table` 엔트리(type widget, files src→dest, registryDependencies: ["tokens"])
4. `packages/llms/summaries/flutter.json` — `summaries.table` 한 줄 요약

## 검증

- `flutter analyze packages/registry/flutter/widgets/sh_ui_table.dart apps/showcase/lib/widgets/sh_ui_table.dart` (또는 showcase 앱 전체 analyze) — 에러 0.
- dual-copy 동일성(원본 == 카피).
- (가능 시) showcase 앱에 임시 사용처로 스모크, 단 페이지는 추가 안 함 — analyze 가 주 게이트.

## 릴리즈 (동반)

신규 위젯 → **MINOR 범프 + 태그 + npm**. (지금까지 docs-only 와 다름.)
- `packages/changelog/versions.json` — 새 엔트리 prepend(type minor, Flutter ShUiTable).
- `packages/cli/package.json` version 범프(레지스트리 번들).
- React summary(react.json) 무관(Flutter 위젯). flutter.json 요약은 위 파일 4번.
- dev → live PR → live 머지 → **live 에서 태그** → publish.yml/release.yml. 태그 푸시(=npm 배포)는 **사용자 명시 승인** 후.

## 백로그 (이후)

- (선택) Flutter table showcase 페이지.
- (선택) Flutter table 필터/선택/페이지 조합 예제.
