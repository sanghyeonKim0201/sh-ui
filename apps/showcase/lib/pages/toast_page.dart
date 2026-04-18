import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_toast.dart';
import '../widgets/sh_ui_button.dart';

class ToastPage extends StatefulWidget {
  const ToastPage({super.key});

  @override
  State<ToastPage> createState() => _ToastPageState();
}

class _ToastPageState extends State<ToastPage> {
  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ShUiToaster(
      child: Scaffold(
        backgroundColor: colors.background,
        appBar: AppBar(
          title: Text('Toast', style: TextStyle(color: colors.foreground)),
          backgroundColor: colors.background,
          elevation: 0,
          iconTheme: IconThemeData(color: colors.foreground),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(height: 1, color: colors.border),
          ),
        ),
        body: Builder(
          builder: (context) => ListView(
            padding: const EdgeInsets.all(24),
            children: [
              // --- Default ---
              _section('Default', colors),
              ShUiButton(
                variant: ShUiButtonVariant.secondary,
                onPressed: () {
                  ShUiToast.show(
                    context,
                    title: '알림',
                    description: '기본 토스트 메시지입니다.',
                  );
                },
                child: const Text('기본 토스트'),
              ),

              const SizedBox(height: 24),

              // --- Success ---
              _section('Success', colors),
              ShUiButton(
                onPressed: () {
                  ShUiToast.success(
                    context,
                    title: '성공',
                    description: '작업이 성공적으로 완료되었습니다.',
                  );
                },
                child: const Text('성공 토스트'),
              ),

              const SizedBox(height: 24),

              // --- Danger ---
              _section('Danger', colors),
              ShUiButton(
                variant: ShUiButtonVariant.danger,
                onPressed: () {
                  ShUiToast.danger(
                    context,
                    title: '오류',
                    description: '요청을 처리하는 중 오류가 발생했습니다.',
                  );
                },
                child: const Text('오류 토스트'),
              ),

              const SizedBox(height: 24),

              // --- Warning ---
              _section('Warning', colors),
              ShUiButton(
                variant: ShUiButtonVariant.ghost,
                onPressed: () {
                  ShUiToast.warning(
                    context,
                    title: '주의',
                    description: '저장하지 않은 변경 사항이 있습니다.',
                  );
                },
                child: const Text('경고 토스트'),
              ),

              const SizedBox(height: 24),

              // --- Description Only ---
              _section('Description Only', colors),
              ShUiButton(
                variant: ShUiButtonVariant.secondary,
                onPressed: () {
                  ShUiToast.show(
                    context,
                    description: '제목 없이 설명만 표시하는 토스트입니다.',
                  );
                },
                child: const Text('설명만 표시'),
              ),

              const SizedBox(height: 24),

              // --- All Variants ---
              _section('All Variants', colors),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  ShUiButton(
                    variant: ShUiButtonVariant.secondary,
                    size: ShUiButtonSize.sm,
                    onPressed: () {
                      ShUiToast.show(context, description: '기본 메시지');
                    },
                    child: const Text('Default'),
                  ),
                  ShUiButton(
                    size: ShUiButtonSize.sm,
                    onPressed: () {
                      ShUiToast.success(context, description: '성공!');
                    },
                    child: const Text('Success'),
                  ),
                  ShUiButton(
                    variant: ShUiButtonVariant.danger,
                    size: ShUiButtonSize.sm,
                    onPressed: () {
                      ShUiToast.danger(context, description: '오류!');
                    },
                    child: const Text('Danger'),
                  ),
                  ShUiButton(
                    variant: ShUiButtonVariant.ghost,
                    size: ShUiButtonSize.sm,
                    onPressed: () {
                      ShUiToast.warning(context, description: '주의!');
                    },
                    child: const Text('Warning'),
                  ),
                ],
              ),
            ],
          ),
        ),
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
