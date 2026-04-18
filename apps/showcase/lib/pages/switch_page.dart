import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_switch.dart';

class SwitchPage extends StatefulWidget {
  const SwitchPage({super.key});

  @override
  State<SwitchPage> createState() => _SwitchPageState();
}

class _SwitchPageState extends State<SwitchPage> {
  bool _mdChecked = false;
  bool _smChecked = false;
  bool _onSwitch = true;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Switch', style: TextStyle(color: colors.foreground)),
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
          // --- Size: md ---
          _section('Medium (default)', colors),
          _switchRow('Notifications', colors,
            ShUiSwitch(
              checked: _mdChecked,
              size: ShUiSwitchSize.md,
              onChanged: (v) => setState(() => _mdChecked = v),
            ),
          ),

          const SizedBox(height: 24),

          // --- Size: sm ---
          _section('Small', colors),
          _switchRow('Compact mode', colors,
            ShUiSwitch(
              checked: _smChecked,
              size: ShUiSwitchSize.sm,
              onChanged: (v) => setState(() => _smChecked = v),
            ),
          ),

          const SizedBox(height: 24),

          // --- On by Default ---
          _section('Initially On', colors),
          _switchRow('Dark theme', colors,
            ShUiSwitch(
              checked: _onSwitch,
              onChanged: (v) => setState(() => _onSwitch = v),
            ),
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          _switchRow('Off (disabled)', colors,
            const ShUiSwitch(
              checked: false,
              enabled: false,
            ),
          ),
          const SizedBox(height: 12),
          _switchRow('On (disabled)', colors,
            const ShUiSwitch(
              checked: true,
              enabled: false,
            ),
          ),

          const SizedBox(height: 24),

          // --- Sizes Comparison ---
          _section('Size Comparison', colors),
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('sm', style: TextStyle(
                    color: colors.foregroundMuted, fontSize: 12,
                  )),
                  const SizedBox(height: 8),
                  ShUiSwitch(
                    checked: true,
                    size: ShUiSwitchSize.sm,
                    onChanged: (_) {},
                  ),
                ],
              ),
              const SizedBox(width: 32),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('md', style: TextStyle(
                    color: colors.foregroundMuted, fontSize: 12,
                  )),
                  const SizedBox(height: 8),
                  ShUiSwitch(
                    checked: true,
                    size: ShUiSwitchSize.md,
                    onChanged: (_) {},
                  ),
                ],
              ),
            ],
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
              'Medium: ${_mdChecked ? "ON" : "OFF"}\n'
              'Small: ${_smChecked ? "ON" : "OFF"}\n'
              'Dark theme: ${_onSwitch ? "ON" : "OFF"}',
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

  Widget _switchRow(String label, ShUiColorTokens colors, Widget switchWidget) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(color: colors.foreground, fontSize: 14),
        ),
        switchWidget,
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
