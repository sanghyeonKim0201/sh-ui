import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_combobox.dart';
import '../widgets/sh_ui_select.dart' show ShUiSelectChip;

class ComboboxPage extends StatefulWidget {
  const ComboboxPage({super.key});

  @override
  State<ComboboxPage> createState() => _ComboboxPageState();
}

class _ComboboxPageState extends State<ComboboxPage> {
  String? _selectedFruit;
  String? _selectedCountry;
  List<String> _multiCities = const [];
  List<String> _multiCustom = const ['서울'];

  static const _fruits = [
    '사과',
    '바나나',
    '포도',
    '오렌지',
    '딸기',
    '수박',
    '참외',
    '복숭아',
    '자두',
    '키위',
  ];

  static const _cities = [
    '서울',
    '부산',
    '대구',
    '인천',
    '광주',
    '대전',
    '울산',
    '세종',
    '수원',
    '제주',
  ];

  static const _countries = [
    '대한민국',
    '미국',
    '일본',
    '중국',
    '영국',
    '독일',
    '프랑스',
    '호주',
    '캐나다',
    '브라질',
  ];

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Combobox', style: TextStyle(color: colors.foreground)),
        backgroundColor: colors.background,
        elevation: 0,
        iconTheme: IconThemeData(color: colors.foreground),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: colors.border),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          // --- Basic ---
          _section('Basic', colors),
          ShUiCombobox<String>(
            value: _selectedFruit,
            onChanged: (v) => setState(() => _selectedFruit = v),
            items: _fruits
                .map((f) => ShUiComboboxItem(value: f, label: f))
                .toList(),
            placeholder: '과일 검색...',
          ),
          const SizedBox(height: 12),
          Text(
            '선택된 값: ${_selectedFruit ?? '없음'}',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 14),
          ),

          const SizedBox(height: 24),

          // --- Searchable Country ---
          _section('Country Search', colors),
          ShUiCombobox<String>(
            value: _selectedCountry,
            onChanged: (v) => setState(() => _selectedCountry = v),
            items: _countries
                .map((c) => ShUiComboboxItem(value: c, label: c))
                .toList(),
            placeholder: '국가 검색...',
          ),
          const SizedBox(height: 12),
          Text(
            '선택된 값: ${_selectedCountry ?? '없음'}',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 14),
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          ShUiCombobox<String>(
            value: null,
            onChanged: null,
            enabled: false,
            items: _fruits
                .map((f) => ShUiComboboxItem(value: f, label: f))
                .toList(),
            placeholder: '검색 불가',
          ),

          const SizedBox(height: 24),

          // --- MultiCombobox (기본 칩) ---
          _section('MultiCombobox', colors),
          ShUiMultiCombobox<String>(
            value: _multiCities,
            onChanged: (v) => setState(() => _multiCities = v),
            items: _cities
                .map((c) => ShUiComboboxItem(value: c, label: c))
                .toList(),
            placeholder: '도시 추가...',
          ),
          const SizedBox(height: 12),
          Text(
            '선택된 도시: ${_multiCities.isEmpty ? '없음' : _multiCities.join(', ')}',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 14),
          ),

          const SizedBox(height: 24),

          // --- MultiCombobox (chip 커스텀) ---
          _section('MultiCombobox — Custom Chips', colors),
          ShUiMultiCombobox<String>(
            value: _multiCustom,
            onChanged: (v) => setState(() => _multiCustom = v),
            items: _cities
                .map((c) => ShUiComboboxItem(value: c, label: c))
                .toList(),
            placeholder: '도시 추가...',
            chipsBuilder: (values, onRemove) => Wrap(
              spacing: shUi.spacing.s1,
              runSpacing: shUi.spacing.s1,
              children: values
                  .map((v) => ShUiSelectChip(
                        label: v,
                        onRemove: () => onRemove(v),
                      ))
                  .toList(),
            ),
          ),
        ],
      ),
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
