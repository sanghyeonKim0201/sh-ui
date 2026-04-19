import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_button.dart';

class ButtonPage extends StatefulWidget {
  const ButtonPage({super.key});

  @override
  State<ButtonPage> createState() => _ButtonPageState();
}

class _ButtonPageState extends State<ButtonPage> {
  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
          // --- Variants ---
          _section('Variants', colors),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ShUiButton(
                variant: ShUiButtonVariant.primary,
                onPressed: () {},
                child: const Text('Primary'),
              ),
              ShUiButton(
                variant: ShUiButtonVariant.secondary,
                onPressed: () {},
                child: const Text('Secondary'),
              ),
              ShUiButton(
                variant: ShUiButtonVariant.ghost,
                onPressed: () {},
                child: const Text('Ghost'),
              ),
              ShUiButton(
                variant: ShUiButtonVariant.danger,
                onPressed: () {},
                child: const Text('Danger'),
              ),
              ShUiButton(
                variant: ShUiButtonVariant.link,
                onPressed: () {},
                child: const Text('Link'),
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
              ShUiButton(
                size: ShUiButtonSize.sm,
                onPressed: () {},
                child: const Text('Small'),
              ),
              ShUiButton(
                size: ShUiButtonSize.md,
                onPressed: () {},
                child: const Text('Medium'),
              ),
              ShUiButton(
                size: ShUiButtonSize.lg,
                onPressed: () {},
                child: const Text('Large'),
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
              const ShUiButton(
                variant: ShUiButtonVariant.primary,
                child: Text('Primary'),
              ),
              const ShUiButton(
                variant: ShUiButtonVariant.secondary,
                child: Text('Secondary'),
              ),
              const ShUiButton(
                variant: ShUiButtonVariant.ghost,
                child: Text('Ghost'),
              ),
              const ShUiButton(
                variant: ShUiButtonVariant.danger,
                child: Text('Danger'),
              ),
              const ShUiButton(
                variant: ShUiButtonVariant.link,
                child: Text('Link'),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- All Sizes x Variants ---
          _section('All Variants at Each Size', colors),
          for (final size in ShUiButtonSize.values) ...[
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(
                size.name.toUpperCase(),
                style: TextStyle(
                  color: colors.foregroundMuted,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                for (final variant in ShUiButtonVariant.values)
                  ShUiButton(
                    variant: variant,
                    size: size,
                    onPressed: () {},
                    child: Text(variant.name[0].toUpperCase() +
                        variant.name.substring(1)),
                  ),
              ],
            ),
            const SizedBox(height: 16),
          ],
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
