import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_table.dart';

class _Person {
  final String name;
  final String role;
  final String team;
  final int age;
  const _Person(this.name, this.role, this.team, this.age);
}

const _people = <_Person>[
  _Person('김상현', 'Maintainer', 'Core', 29),
  _Person('이도윤', 'Designer', 'Design', 34),
  _Person('박서연', 'Engineer', 'Web', 27),
  _Person('최민준', 'PM', 'Product', 41),
  _Person('정하은', 'Engineer', 'Web', 23),
];

final _columns = <ShUiTableColumn<_Person>>[
  ShUiTableColumn(
    id: 'name',
    header: '이름',
    cell: (p) => p.name,
    sortKey: (p) => p.name,
  ),
  ShUiTableColumn(
    id: 'role',
    header: '역할',
    cell: (p) => p.role,
    sortKey: (p) => p.role,
  ),
  ShUiTableColumn(
    id: 'team',
    header: '팀',
    cell: (p) => p.team,
  ),
  ShUiTableColumn(
    id: 'age',
    header: '나이',
    cell: (p) => '${p.age}',
    sortKey: (p) => p.age,
    align: TextAlign.end,
  ),
];

class TablePage extends StatelessWidget {
  const TablePage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _section('기본 — 헤더 탭으로 정렬', colors),
        ShUiTable<_Person>(columns: _columns, rows: _people),
        const SizedBox(height: 24),
        _section('zebra — 홀짝 행 배경', colors),
        ShUiTable<_Person>(columns: _columns, rows: _people, zebra: true),
        const SizedBox(height: 24),
        _section('밀도 sm + caption', colors),
        ShUiTable<_Person>(
          columns: _columns,
          rows: _people,
          size: ShUiTableSize.sm,
          caption: '팀 구성원 ${_people.length}명',
        ),
        const SizedBox(height: 24),
        _section('초기 정렬 — 나이 내림차순', colors),
        ShUiTable<_Person>(
          columns: _columns,
          rows: _people,
          initialSortColumnId: 'age',
          initialSortDirection: ShUiSortDirection.descending,
        ),
      ],
    );
  }

  Widget _section(String title, ShUiColorTokens colors) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: TextStyle(
          color: colors.foreground,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
