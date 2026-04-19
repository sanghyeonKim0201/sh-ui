import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_toggle.dart';

class TogglePage extends StatefulWidget {
  const TogglePage({super.key});

  @override
  State<TogglePage> createState() => _TogglePageState();
}

class _TogglePageState extends State<TogglePage> {
  bool _ghostPressed = false;
  bool _outlinePressed = false;

  // Single-select group
  Set<String> _alignValue = {'left'};

  // Multi-select group
  Set<String> _formatValue = {'bold'};

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Toggle', style: TextStyle(color: colors.foreground)),
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
          // --- Ghost Variant ---
          _section('Ghost Variant', colors),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ShUiToggle(
                pressed: _ghostPressed,
                variant: ShUiToggleVariant.ghost,
                onPressedChange: (v) =>
                    setState(() => _ghostPressed = v),
                child: const Icon(Icons.format_bold),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Outline Variant ---
          _section('Outline Variant', colors),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ShUiToggle(
                pressed: _outlinePressed,
                variant: ShUiToggleVariant.outline,
                onPressedChange: (v) =>
                    setState(() => _outlinePressed = v),
                child: const Icon(Icons.format_italic),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Sizes ---
          _section('Sizes', colors),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              ShUiToggle(
                pressed: true,
                size: ShUiToggleSize.sm,
                variant: ShUiToggleVariant.outline,
                onPressedChange: (_) {},
                child: const Text('SM'),
              ),
              ShUiToggle(
                pressed: true,
                size: ShUiToggleSize.md,
                variant: ShUiToggleVariant.outline,
                onPressedChange: (_) {},
                child: const Text('MD'),
              ),
              ShUiToggle(
                pressed: true,
                size: ShUiToggleSize.lg,
                variant: ShUiToggleVariant.outline,
                onPressedChange: (_) {},
                child: const Text('LG'),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              const ShUiToggle(
                pressed: false,
                variant: ShUiToggleVariant.outline,
                child: Icon(Icons.format_bold),
              ),
              const ShUiToggle(
                pressed: true,
                variant: ShUiToggleVariant.outline,
                child: Icon(Icons.format_italic),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Single-Select Toggle Group ---
          _section('Toggle Group (single select)', colors),
          ShUiToggleGroup<String>(
            value: _alignValue,
            variant: ShUiToggleVariant.outline,
            onValueChange: (v) => setState(() => _alignValue = v),
            children: const [
              ShUiToggleGroupItem(
                value: 'left',
                child: Icon(Icons.format_align_left),
              ),
              ShUiToggleGroupItem(
                value: 'center',
                child: Icon(Icons.format_align_center),
              ),
              ShUiToggleGroupItem(
                value: 'right',
                child: Icon(Icons.format_align_right),
              ),
              ShUiToggleGroupItem(
                value: 'justify',
                child: Icon(Icons.format_align_justify),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Multi-Select Toggle Group ---
          _section('Toggle Group (multi select)', colors),
          ShUiToggleGroup<String>(
            value: _formatValue,
            multiple: true,
            variant: ShUiToggleVariant.outline,
            onValueChange: (v) => setState(() => _formatValue = v),
            children: const [
              ShUiToggleGroupItem(
                value: 'bold',
                child: Icon(Icons.format_bold),
              ),
              ShUiToggleGroupItem(
                value: 'italic',
                child: Icon(Icons.format_italic),
              ),
              ShUiToggleGroupItem(
                value: 'underline',
                child: Icon(Icons.format_underline),
              ),
            ],
          ),

          const SizedBox(height: 24),

          const SizedBox(height: 24),

          // --- Vertical Toggle Group ---
          _section('Toggle Group (vertical)', colors),
          SizedBox(
            width: 160,
            child: ShUiToggleGroup<String>(
              value: _alignValue,
              variant: ShUiToggleVariant.outline,
              orientation: ShUiToggleOrientation.vertical,
              onValueChange: (v) => setState(() => _alignValue = v),
              children: const [
                ShUiToggleGroupItem(
                  value: 'left',
                  child: Icon(Icons.format_align_left),
                ),
                ShUiToggleGroupItem(
                  value: 'center',
                  child: Icon(Icons.format_align_center),
                ),
                ShUiToggleGroupItem(
                  value: 'right',
                  child: Icon(Icons.format_align_right),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // --- Current State ---
          _section('Current State', colors),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: colors.backgroundSubtle,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: colors.border),
            ),
            child: Text(
              'Ghost: ${_ghostPressed ? "ON" : "OFF"}\n'
              'Outline: ${_outlinePressed ? "ON" : "OFF"}\n'
              'Align: ${_alignValue.join(", ")}\n'
              'Format: ${_formatValue.join(", ")}',
              style: TextStyle(
                color: colors.foreground,
                fontSize: 13,
                fontFamily: 'monospace',
                height: 1.6,
              ),
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
