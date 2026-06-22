# Flutter ShUiTable Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flutter registry/showcase 에 정렬 내장 데이터 테이블 위젯 `ShUiTable<T>` 을 추가한다(Tree 선례 범위 — 위젯 듀얼카피 + registry.json + flutter.json 요약 + 릴리즈).

**Architecture:** `ShUiTableColumn<T>`(id/header/cell/sortKey/align) + `ShUiTable<T>`(StatefulWidget, 내부 정렬 state). 헤더 탭 → asc/desc 토글. sh-ui 토큰 테마(Tree 위젯과 동일한 `Theme.of(context).extension<ShUiTheme>()` 접근).

**Tech Stack:** Flutter/Dart, `sh_ui_tokens.dart`(ShUiTheme).

**작업 디렉토리:** `/Users/gimsanghyeon/development/PROJECT/sh-ui` (브랜치 `feat/flutter-table`). 검증 `flutter analyze`.

> **릴리즈 동반(신규 위젯 MINOR).** versions.json + cli 범프. 태그·npm 은 사용자 승인 후 live 에서.

---

## File Structure

| 파일 | 변경 |
|---|---|
| `packages/registry/flutter/widgets/sh_ui_table.dart` | 신규 — ShUiTable 위젯(원본) |
| `apps/showcase/lib/widgets/sh_ui_table.dart` | 신규 — 듀얼 카피(동일 내용) |
| `packages/registry/flutter/registry.json` | `table` 엔트리 추가 |
| `packages/llms/summaries/flutter.json` | `summaries.table` 요약 추가 |
| `packages/changelog/versions.json` | 새 엔트리 prepend(릴리즈 시) |
| `packages/cli/package.json` | version 범프(릴리즈 시) |

---

## Task 1: ShUiTable 위젯 (registry 원본)

**Files:**
- Create: `packages/registry/flutter/widgets/sh_ui_table.dart`

- [ ] **Step 1: 작성**

```dart
import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// 테이블 밀도. [sm]은 행 높이·폰트가 더 컴팩트한 변형.
enum ShUiTableSize { sm, md }

/// 정렬 방향.
enum ShUiSortDirection { ascending, descending }

/// 테이블 컬럼 정의.
class ShUiTableColumn<T> {
  /// 정렬 상태 추적 키.
  final String id;

  /// 헤더에 표시될 라벨.
  final String header;

  /// 행에서 셀 표시 텍스트를 뽑는 접근자.
  final String Function(T row) cell;

  /// 정렬 키 접근자. 제공되면 이 컬럼은 헤더 탭으로 정렬 가능해진다.
  final Comparable<Object?> Function(T row)? sortKey;

  /// 셀/헤더 텍스트 정렬. 기본 [TextAlign.start].
  final TextAlign align;

  const ShUiTableColumn({
    required this.id,
    required this.header,
    required this.cell,
    this.sortKey,
    this.align = TextAlign.start,
  });

  bool get sortable => sortKey != null;
}

/// shUi Table — 컬럼 정의 + 행 데이터로 렌더하는 themed 데이터 테이블.
///
/// 정렬 가능 컬럼(헤더 탭 → ▲/▼, 단일 컬럼 asc/desc 토글)을 내장한다.
/// sh-ui 토큰으로 테마링하며 Semantics(스크린 리더)를 제공한다.
class ShUiTable<T> extends StatefulWidget {
  final List<ShUiTableColumn<T>> columns;
  final List<T> rows;
  final ShUiTableSize size;
  final bool zebra;
  final String? caption;
  final String? initialSortColumnId;
  final ShUiSortDirection initialSortDirection;

  const ShUiTable({
    super.key,
    required this.columns,
    required this.rows,
    this.size = ShUiTableSize.md,
    this.zebra = false,
    this.caption,
    this.initialSortColumnId,
    this.initialSortDirection = ShUiSortDirection.ascending,
  });

  @override
  State<ShUiTable<T>> createState() => _ShUiTableState<T>();
}

class _ShUiTableState<T> extends State<ShUiTable<T>> {
  String? _sortId;
  late ShUiSortDirection _sortDir;

  @override
  void initState() {
    super.initState();
    _sortId = widget.initialSortColumnId;
    _sortDir = widget.initialSortDirection;
  }

  void _onHeaderTap(ShUiTableColumn<T> col) {
    if (!col.sortable) return;
    setState(() {
      if (_sortId == col.id) {
        _sortDir = _sortDir == ShUiSortDirection.ascending
            ? ShUiSortDirection.descending
            : ShUiSortDirection.ascending;
      } else {
        _sortId = col.id;
        _sortDir = ShUiSortDirection.ascending;
      }
    });
  }

  List<T> _sortedRows() {
    final id = _sortId;
    if (id == null) return widget.rows;
    ShUiTableColumn<T>? col;
    for (final c in widget.columns) {
      if (c.id == id) {
        col = c;
        break;
      }
    }
    final key = col?.sortKey;
    if (key == null) return widget.rows;
    final copy = List<T>.from(widget.rows);
    copy.sort((a, b) {
      final cmp = key(a).compareTo(key(b));
      return _sortDir == ShUiSortDirection.ascending ? cmp : -cmp;
    });
    return copy;
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final sm = widget.size == ShUiTableSize.sm;
    final fontSize = sm ? shUi.text.xs : shUi.text.sm;
    final vPad = sm ? shUi.spacing.s2 : shUi.spacing.s3;
    final hPad = shUi.spacing.s3;
    final rows = _sortedRows();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            border: Border.all(color: colors.border, width: shUi.borderWidth.normal),
            borderRadius: BorderRadius.circular(shUi.radius.md),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(shUi.radius.md),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildHeader(shUi, colors, fontSize, vPad, hPad),
                for (var i = 0; i < rows.length; i++)
                  _buildBodyRow(
                    shUi,
                    colors,
                    fontSize,
                    vPad,
                    hPad,
                    rows[i],
                    i,
                    isLast: i == rows.length - 1,
                  ),
              ],
            ),
          ),
        ),
        if (widget.caption != null) ...[
          SizedBox(height: shUi.spacing.s2),
          Text(
            widget.caption!,
            style: TextStyle(color: colors.foregroundMuted, fontSize: shUi.text.xs),
          ),
        ],
      ],
    );
  }

  Widget _buildHeader(
    ShUiTheme shUi,
    ShUiColorTokens colors,
    double fontSize,
    double vPad,
    double hPad,
  ) {
    return Container(
      color: colors.backgroundMuted,
      child: Row(
        children: [
          for (final col in widget.columns)
            Expanded(child: _headerCell(shUi, colors, fontSize, vPad, hPad, col)),
        ],
      ),
    );
  }

  Widget _headerCell(
    ShUiTheme shUi,
    ShUiColorTokens colors,
    double fontSize,
    double vPad,
    double hPad,
    ShUiTableColumn<T> col,
  ) {
    final isSorted = _sortId == col.id;
    final arrow = !isSorted
        ? null
        : (_sortDir == ShUiSortDirection.ascending ? '▲' : '▼');
    final label = Row(
      mainAxisAlignment: col.align == TextAlign.end
          ? MainAxisAlignment.end
          : MainAxisAlignment.start,
      children: [
        Flexible(
          child: Text(
            col.header,
            textAlign: col.align,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: fontSize,
              fontWeight: shUi.weight.medium,
            ),
          ),
        ),
        if (arrow != null) ...[
          const SizedBox(width: 4),
          Text(
            arrow,
            style: TextStyle(color: colors.foregroundMuted, fontSize: fontSize),
          ),
        ],
      ],
    );
    final padded = Padding(
      padding: EdgeInsets.symmetric(vertical: vPad, horizontal: hPad),
      child: label,
    );
    if (!col.sortable) {
      return Semantics(header: true, child: padded);
    }
    return Semantics(
      header: true,
      button: true,
      label: '${col.header}, 정렬'
          '${isSorted ? (_sortDir == ShUiSortDirection.ascending ? ', 오름차순' : ', 내림차순') : ''}',
      child: InkWell(onTap: () => _onHeaderTap(col), child: padded),
    );
  }

  Widget _buildBodyRow(
    ShUiTheme shUi,
    ShUiColorTokens colors,
    double fontSize,
    double vPad,
    double hPad,
    T row,
    int index, {
    required bool isLast,
  }) {
    final bg = widget.zebra && index.isOdd
        ? colors.backgroundSubtle
        : colors.background;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: bg,
        border: isLast
            ? null
            : Border(bottom: BorderSide(color: colors.border, width: shUi.borderWidth.normal)),
      ),
      child: Row(
        children: [
          for (final col in widget.columns)
            Expanded(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: vPad, horizontal: hPad),
                child: Text(
                  col.cell(row),
                  textAlign: col.align,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: fontSize,
                    fontWeight: shUi.weight.regular,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
```

- [ ] **Step 2: analyze (registry 위젯)**
Run:
```bash
~/flutter/bin/flutter analyze packages/registry/flutter/widgets/sh_ui_table.dart 2>&1 | tail -20
```
Expected: "No issues found!" (또는 0 errors). 타입/토큰 필드명 불일치 시 `sh_ui_tokens.dart` 의 실제 필드(colors.background/backgroundMuted/backgroundSubtle/foreground/foregroundMuted/border, spacing.s2/s3, text.xs/sm, weight.medium/regular, borderWidth.normal, radius.md)에 맞춰 수정.
> 참고: registry 위젯은 상대 import(`../foundation/sh_ui_tokens.dart`)라 단일 파일 analyze 가 안 되면 showcase 카피(Task 2)로 showcase 앱 전체 analyze 로 검증.

- [ ] **Step 3: 커밋**
```bash
git add packages/registry/flutter/widgets/sh_ui_table.dart
git commit -m "feat(flutter): ShUiTable 정렬 데이터 테이블 위젯 (registry)"
```

---

## Task 2: showcase 듀얼 카피

**Files:**
- Create: `apps/showcase/lib/widgets/sh_ui_table.dart`

- [ ] **Step 1: 카피**
registry 원본을 showcase 로 복사. import 경로는 showcase 위젯들의 관행을 따른다(다른 showcase 위젯이 `../foundation/sh_ui_tokens.dart` 를 쓰면 동일, 다르면 맞춤).
```bash
# 먼저 기존 showcase 위젯의 토큰 import 경로 확인
head -5 apps/showcase/lib/widgets/sh_ui_tree.dart
# 동일 경로면 그대로 복사
cp packages/registry/flutter/widgets/sh_ui_table.dart apps/showcase/lib/widgets/sh_ui_table.dart
```
import 경로가 다르면 `apps/showcase/lib/widgets/sh_ui_table.dart` 의 첫 import 만 showcase 관행에 맞게 조정(본문은 동일 유지).

- [ ] **Step 2: showcase 앱 analyze**
Run:
```bash
cd apps/showcase && ~/flutter/bin/flutter analyze lib/widgets/sh_ui_table.dart 2>&1 | tail -20
```
Expected: 0 errors. (전체 analyze 가 느리면 파일 단위.)

- [ ] **Step 3: dual-copy 동일성 확인**
Run:
```bash
diff <(sed '1,8d' packages/registry/flutter/widgets/sh_ui_table.dart) <(sed '1,8d' apps/showcase/lib/widgets/sh_ui_table.dart) && echo "본문 동일"
```
Expected: import 라인 외 본문 동일.

- [ ] **Step 4: 커밋**
```bash
git add apps/showcase/lib/widgets/sh_ui_table.dart
git commit -m "feat(showcase): ShUiTable 듀얼 카피"
```

---

## Task 3: registry.json + flutter.json 요약

**Files:**
- Modify: `packages/registry/flutter/registry.json`
- Modify: `packages/llms/summaries/flutter.json`

- [ ] **Step 1: registry.json 에 table 엔트리 추가**
`components` 객체에 `tree` 엔트리와 같은 형태로 `table` 추가:
```json
"table": {
  "name": "table",
  "type": "widget",
  "files": [
    { "src": "widgets/sh_ui_table.dart", "dest": "{widgets}/sh_ui_table.dart" }
  ],
  "dependencies": [],
  "registryDependencies": ["tokens"]
}
```
(JSON 유효성 유지 — 적절한 위치에 콤마. `python3 -m json.tool` 로 검증.)

- [ ] **Step 2: flutter.json 요약 추가**
`summaries` 객체에 `tree` 다음 등 적절한 위치에 추가:
```json
"table": "ShUiTable<T> — 정렬 내장 데이터 테이블. ShUiTableColumn(id/header/cell/sortKey/align) 정의 + rows. 헤더 탭 정렬(▲/▼, asc/desc), 밀도 sm/md, zebra, caption, Semantics. sortKey 있는 컬럼만 정렬 가능."
```

- [ ] **Step 3: JSON 유효성 검증**
Run:
```bash
python3 -m json.tool packages/registry/flutter/registry.json >/dev/null && echo "registry.json OK"
python3 -m json.tool packages/llms/summaries/flutter.json >/dev/null && echo "flutter.json OK"
```
Expected: 둘 다 OK.

- [ ] **Step 4: 커밋**
```bash
git add packages/registry/flutter/registry.json packages/llms/summaries/flutter.json
git commit -m "feat(flutter): registry.json + flutter.json 에 table 등록"
```

---

## Task 4: 릴리즈 반영 (versions.json + cli 범프)

> 현재 버전 확인 후 MINOR 범프. 예: 0.119.0 → 0.120.0 (실제 현재 버전 기준).

**Files:**
- Modify: `packages/changelog/versions.json`
- Modify: `packages/cli/package.json`

- [ ] **Step 1: 현재 버전 확인**
Run:
```bash
node -e "console.log('cli', require('./packages/cli/package.json').version); const v=require('./packages/changelog/versions.json'); console.log('latest', v.versions ? v.versions[0].version : v[0].version)"
```

- [ ] **Step 2: versions.json prepend**
`versions` 배열 맨 앞에(현재 최신 버전 +0.1.0, MINOR):
```json
{
  "version": "X.Y.0",
  "date": "2026-06-22",
  "title": "Flutter ShUiTable — 정렬 데이터 테이블 위젯",
  "type": "minor",
  "highlights": [
    "ShUiTable<T> — 컬럼 정의(ShUiTableColumn) + 행 데이터로 렌더하는 Flutter 데이터 테이블",
    "헤더 탭 정렬(▲/▼, asc/desc) 내장, 밀도 sm/md, zebra, caption, Semantics",
    "sh-ui 토큰 테마. CLI: sh-ui add table (flutter)"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/vX.Y.0"
}
```

- [ ] **Step 3: cli/package.json version 동기화**
`packages/cli/package.json` 의 `version` 을 같은 `X.Y.0` 으로.

- [ ] **Step 4: 커밋**
```bash
git add packages/changelog/versions.json packages/cli/package.json
git commit -m "release: vX.Y.0 — Flutter ShUiTable"
```

---

## Task 5: dev push → live PR → (승인 후) 태그

- [ ] dev push: `git push origin feat/flutter-table` 후 PR `--base live`.
- [ ] CI 그린(test). visual 의 label 1px 는 무관.
- [ ] **머지·태그·npm 은 사용자 승인 후.** live 머지 → `git checkout live && git pull` → `git tag vX.Y.0 && git push origin vX.Y.0`(publish.yml/release.yml 발동) — **태그 푸시(npm 배포)는 명시 승인 필수.**
- [ ] dev 동기화.

---

## 릴리즈 절차
신규 위젯 → MINOR. dev → live PR → live 머지 → **live 에서 태그(사용자 승인)** → publish.yml(npm) + release.yml(GH Release, versions.json highlights 사용).

## 자기 점검 메모
- 듀얼 카피 동기화(registry ↔ showcase), import 라인만 차이 가능.
- registry.json + flutter.json 요약 = lint:drift 통과 조건(Flutter 신규 위젯).
- 정렬: sortKey 있는 컬럼만, 헤더 탭 asc/desc 토글, List.from 복사본 정렬(원본 불변).
- 토큰: colors.background/backgroundMuted/backgroundSubtle/foreground/foregroundMuted/border, spacing.s2/s3, text.xs/sm, weight.medium/regular, borderWidth.normal, radius.md.
- 검증: flutter analyze(registry 단일 파일 안 되면 showcase 카피로 앱 analyze).

---

## Self-Review

**1. Spec coverage:** ShUiTableColumn/ShUiTable(Task1) / 듀얼카피(Task2) / registry+flutter.json(Task3) / 릴리즈(Task4) / PR·태그(Task5). 정렬 내장·밀도·zebra·caption·Semantics 모두 위젯 코드에 포함 ✅
**2. Placeholder scan:** Task1 위젯 코드는 완전(분석 가능한 Dart). versions.json 의 X.Y.0 은 Step1 에서 실제 버전 확인 후 확정 — placeholder 가 아니라 런타임 결정값 ✅
**3. Type consistency:** `ShUiTable<T>`/`ShUiTableColumn<T>`/`_ShUiTableState<T>`/`ShUiSortDirection`/`ShUiTableSize` 명칭 일관. 토큰 접근(`shUi.colors`/`.spacing`/`.text`/`.weight`/`.borderWidth`/`.radius`)은 Tree 위젯과 동일 패턴 ✅
