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
            borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
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
            : Border(
                bottom: BorderSide(color: colors.border, width: shUi.borderWidth.normal),
              ),
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
