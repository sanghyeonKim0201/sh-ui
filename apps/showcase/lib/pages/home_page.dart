import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import 'button_page.dart';
import 'card_page.dart';
import 'checkbox_page.dart';
import 'radio_page.dart';
import 'switch_page.dart';
import 'toggle_page.dart';
import 'input_page.dart';
import 'textarea_page.dart';
import 'label_page.dart';
import 'slider_page.dart';
import 'select_page.dart';
import 'tabs_page.dart';
import 'dialog_page.dart';
import 'popover_page.dart';
import 'toast_page.dart';
import 'date_picker_page.dart';
import 'color_picker_page.dart';
import 'combobox_page.dart';
import 'file_upload_page.dart';
import 'sidebar_page.dart';

class HomePage extends StatelessWidget {
  final ThemeMode themeMode;
  final VoidCallback onToggleTheme;

  const HomePage({
    super.key,
    required this.themeMode,
    required this.onToggleTheme,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text(
          'sh-ui',
          style: TextStyle(
            color: colors.foreground,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
          ),
        ),
        backgroundColor: colors.background,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        actions: [
          IconButton(
            icon: Icon(
              themeMode == ThemeMode.light
                  ? Icons.dark_mode_outlined
                  : Icons.light_mode_outlined,
              color: colors.foreground,
            ),
            onPressed: onToggleTheme,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: colors.border),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '위젯 쇼케이스',
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '담백하게 설계된 Flutter 디자인 시스템',
                  style: TextStyle(
                    color: colors.foregroundMuted,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),

          // Form
          _SectionTitle('폼', colors),
          _ComponentGrid(
            colors: colors,
            items: [
              _Item('Button', Icons.smart_button_outlined, const ButtonPage()),
              _Item('Input', Icons.text_fields, const InputPage()),
              _Item('Textarea', Icons.notes, const TextareaPage()),
              _Item('Checkbox', Icons.check_box_outlined, const CheckboxPage()),
              _Item('Radio', Icons.radio_button_checked, const RadioPage()),
              _Item('Switch', Icons.toggle_on_outlined, const SwitchPage()),
              _Item('Toggle', Icons.toggle_off_outlined, const TogglePage()),
              _Item('Slider', Icons.tune, const SliderPage()),
              _Item('Label', Icons.label_outline, const LabelPage()),
            ],
          ),

          const SizedBox(height: 24),

          // Selection
          _SectionTitle('선택', colors),
          _ComponentGrid(
            colors: colors,
            items: [
              _Item('Select', Icons.arrow_drop_down_circle_outlined, const SelectPage()),
              _Item('Combobox', Icons.search, const ComboboxPage()),
              _Item('Date Picker', Icons.calendar_today_outlined, const DatePickerPage()),
              _Item('Color Picker', Icons.palette_outlined, const ColorPickerPage()),
            ],
          ),

          const SizedBox(height: 24),

          // Layout
          _SectionTitle('레이아웃', colors),
          _ComponentGrid(
            colors: colors,
            items: [
              _Item('Card', Icons.credit_card, const CardPage()),
              _Item('Tabs', Icons.tab, const TabsPage()),
              _Item('Sidebar', Icons.menu, const SidebarPage()),
            ],
          ),

          const SizedBox(height: 24),

          // Overlay
          _SectionTitle('오버레이', colors),
          _ComponentGrid(
            colors: colors,
            items: [
              _Item('Dialog', Icons.open_in_new, const DialogPage()),
              _Item('Popover', Icons.chat_bubble_outline, const PopoverPage()),
              _Item('Toast', Icons.notifications_outlined, const ToastPage()),
            ],
          ),

          const SizedBox(height: 24),

          // File
          _SectionTitle('파일', colors),
          _ComponentGrid(
            colors: colors,
            items: [
              _Item('File Upload', Icons.upload_file, const FileUploadPage()),
            ],
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final ShUiColorTokens colors;

  const _SectionTitle(this.title, this.colors);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: TextStyle(
          color: colors.foregroundMuted,
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 1,
        ),
      ),
    );
  }
}

class _Item {
  final String label;
  final IconData icon;
  final Widget page;
  const _Item(this.label, this.icon, this.page);
}

class _ComponentGrid extends StatelessWidget {
  final ShUiColorTokens colors;
  final List<_Item> items;

  const _ComponentGrid({required this.colors, required this.items});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: items.map((item) {
        return _ComponentTile(
          label: item.label,
          icon: item.icon,
          colors: colors,
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => item.page),
          ),
        );
      }).toList(),
    );
  }
}

class _ComponentTile extends StatefulWidget {
  final String label;
  final IconData icon;
  final ShUiColorTokens colors;
  final VoidCallback onTap;

  const _ComponentTile({
    required this.label,
    required this.icon,
    required this.colors,
    required this.onTap,
  });

  @override
  State<_ComponentTile> createState() => _ComponentTileState();
}

class _ComponentTileState extends State<_ComponentTile> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final width = (MediaQuery.of(context).size.width - 48) / 3;

    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          width: width.clamp(100, 140),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          decoration: BoxDecoration(
            color: _hover
                ? widget.colors.backgroundSubtle
                : widget.colors.background,
            border: Border.all(color: widget.colors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(widget.icon, size: 24, color: widget.colors.foreground),
              const SizedBox(height: 8),
              Text(
                widget.label,
                style: TextStyle(
                  color: widget.colors.foreground,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
