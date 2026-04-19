import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_select.dart';

class SelectPage extends StatefulWidget {
  const SelectPage({super.key});

  @override
  State<SelectPage> createState() => _SelectPageState();
}

class _SelectPageState extends State<SelectPage> {
  String? _selected;
  String? _selectedDisabled;
  String? _selectedCountry;
  List<String> _multiFruits = const [];
  List<String> _multiChipsFruits = const ['apple', 'grape'];

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
          // --- Basic ---
          _section('Basic', colors),
          ShUiSelect<String>(
            value: _selected,
            onChanged: (v) => setState(() => _selected = v),
            placeholder: '과일 선택',
            items: const [
              ShUiSelectItem(value: 'apple', child: Text('사과')),
              ShUiSelectItem(value: 'banana', child: Text('바나나')),
              ShUiSelectItem(value: 'grape', child: Text('포도')),
              ShUiSelectItem(value: 'orange', child: Text('오렌지')),
              ShUiSelectItem(value: 'strawberry', child: Text('딸기')),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '선택된 값: ${_selected ?? '없음'}',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 14),
          ),

          const SizedBox(height: 24),

          // --- With Many Items ---
          _section('Many Items', colors),
          ShUiSelect<String>(
            value: null,
            onChanged: (v) {},
            placeholder: '국가 선택',
            items: const [
              ShUiSelectItem(value: 'kr', child: Text('대한민국')),
              ShUiSelectItem(value: 'us', child: Text('미국')),
              ShUiSelectItem(value: 'jp', child: Text('일본')),
              ShUiSelectItem(value: 'cn', child: Text('중국')),
              ShUiSelectItem(value: 'gb', child: Text('영국')),
              ShUiSelectItem(value: 'de', child: Text('독일')),
              ShUiSelectItem(value: 'fr', child: Text('프랑스')),
              ShUiSelectItem(value: 'au', child: Text('호주')),
            ],
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          ShUiSelect<String>(
            value: _selectedDisabled,
            onChanged: null,
            placeholder: '선택 불가',
            enabled: false,
            items: const [
              ShUiSelectItem(value: 'a', child: Text('항목 A')),
              ShUiSelectItem(value: 'b', child: Text('항목 B')),
            ],
          ),

          const SizedBox(height: 24),

          // --- Invalid ---
          _section('Invalid', colors),
          ShUiSelect<String>(
            value: null,
            onChanged: (v) {},
            placeholder: '필수 항목',
            invalid: true,
            items: const [
              ShUiSelectItem(value: 'x', child: Text('항목 X')),
              ShUiSelectItem(value: 'y', child: Text('항목 Y')),
            ],
          ),

          const SizedBox(height: 24),

          // --- Groups + Separator ---
          _section('Groups + Separator', colors),
          ShUiSelect<String>(
            value: _selectedCountry,
            onChanged: (v) => setState(() => _selectedCountry = v),
            placeholder: '국가 선택',
            elements: const [
              ShUiSelectGroup(
                label: '아시아',
                items: [
                  ShUiSelectItem(value: 'kr', child: Text('대한민국')),
                  ShUiSelectItem(value: 'jp', child: Text('일본')),
                  ShUiSelectItem(value: 'tw', child: Text('대만')),
                ],
              ),
              ShUiSelectSeparator(),
              ShUiSelectGroup(
                label: '유럽',
                items: [
                  ShUiSelectItem(value: 'de', child: Text('독일')),
                  ShUiSelectItem(value: 'fr', child: Text('프랑스')),
                  ShUiSelectItem(value: 'uk', child: Text('영국')),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '선택된 국가: ${_selectedCountry ?? '없음'}',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 14),
          ),

          const SizedBox(height: 24),

          // --- MultiSelect (기본) ---
          _section('MultiSelect', colors),
          ShUiMultiSelect<String>(
            value: _multiFruits,
            onChanged: (v) => setState(() => _multiFruits = v),
            placeholder: '과일을 여러 개 선택',
            elements: const [
              ShUiSelectItem(value: 'apple', child: Text('사과')),
              ShUiSelectItem(value: 'banana', child: Text('바나나')),
              ShUiSelectItem(value: 'grape', child: Text('포도')),
              ShUiSelectItem(value: 'orange', child: Text('오렌지')),
              ShUiSelectItem(value: 'strawberry', child: Text('딸기')),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '선택된 과일: ${_multiFruits.isEmpty ? '없음' : _multiFruits.join(', ')}',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 14),
          ),

          const SizedBox(height: 24),

          // --- MultiSelect (chip 렌더 커스텀) ---
          _section('MultiSelect — Chips', colors),
          ShUiMultiSelect<String>(
            value: _multiChipsFruits,
            onChanged: (v) => setState(() => _multiChipsFruits = v),
            placeholder: '과일 선택',
            elements: const [
              ShUiSelectItem(value: 'apple', child: Text('사과')),
              ShUiSelectItem(value: 'banana', child: Text('바나나')),
              ShUiSelectItem(value: 'grape', child: Text('포도')),
              ShUiSelectItem(value: 'orange', child: Text('오렌지')),
              ShUiSelectItem(value: 'strawberry', child: Text('딸기')),
            ],
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
