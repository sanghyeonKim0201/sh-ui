import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_dialog.dart';
import '../widgets/sh_ui_button.dart';

class DialogPage extends StatefulWidget {
  const DialogPage({super.key});

  @override
  State<DialogPage> createState() => _DialogPageState();
}

class _DialogPageState extends State<DialogPage> {
  bool _declarativeOpen = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
          // --- Basic Dialog ---
          _section('Basic Dialog', colors),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ShUiButton(
                onPressed: () => _showBasicDialog(context),
                child: const Text('기본 대화상자'),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Confirmation Dialog ---
          _section('Confirmation Dialog', colors),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ShUiButton(
                variant: ShUiButtonVariant.secondary,
                onPressed: () => _showConfirmDialog(context),
                child: const Text('확인 대화상자'),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Danger Dialog ---
          _section('Danger Dialog', colors),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ShUiButton(
                variant: ShUiButtonVariant.danger,
                onPressed: () => _showDangerDialog(context),
                child: const Text('삭제 대화상자'),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Custom Content Dialog ---
          _section('Custom Content Dialog', colors),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ShUiButton(
                variant: ShUiButtonVariant.ghost,
                onPressed: () => _showCustomContentDialog(context),
                child: const Text('커스텀 컨텐츠'),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Declarative (controlled) Dialog ---
          _section('선언형 (declarative)', colors),
          Text(
            'open / onOpenChange로 상태 기반 제어.',
            style: TextStyle(color: colors.foregroundMuted, fontSize: 13),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ShUiButton(
                onPressed: () => setState(() => _declarativeOpen = true),
                child: const Text('선언형 열기'),
              ),
            ],
          ),
          // 선언형 ShUiDialog — open이 true가 되면 Overlay에 삽입.
          ShUiDialog(
            open: _declarativeOpen,
            onOpenChange: (v) => setState(() => _declarativeOpen = v),
            child: ShUiDialogContent(
              header: const ShUiDialogHeader(
                title: '선언형 Dialog',
                description: '외부 상태(_declarativeOpen)와 동기화됩니다.',
              ),
              body: Text(
                '백드롭 탭, × 버튼, 하드웨어 백/Esc 모두 onOpenChange(false)를 호출합니다.',
                style: TextStyle(color: colors.foreground, fontSize: 14),
              ),
              footer: ShUiDialogFooter(
                children: [
                  ShUiButton(
                    variant: ShUiButtonVariant.secondary,
                    onPressed: () => setState(() => _declarativeOpen = false),
                    child: const Text('취소'),
                  ),
                  ShUiButton(
                    onPressed: () => setState(() => _declarativeOpen = false),
                    child: const Text('확인'),
                  ),
                ],
              ),
            ),
          ),
        ],
    );
  }

  void _showBasicDialog(BuildContext context) {
    ShUiDialog.show(
      context: context,
      builder: (context) => ShUiDialogContent(
        title: const ShUiDialogTitle('알림'),
        description: const ShUiDialogDescription('작업이 성공적으로 완료되었습니다.'),
        footer: ShUiDialogFooter(
          children: [
            ShUiButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('확인'),
            ),
          ],
        ),
      ),
    );
  }

  void _showConfirmDialog(BuildContext context) {
    ShUiDialog.show(
      context: context,
      builder: (context) => ShUiDialogContent(
        title: const ShUiDialogTitle('변경 사항 저장'),
        description: const ShUiDialogDescription(
          '저장하지 않은 변경 사항이 있습니다. 저장하시겠습니까?',
        ),
        footer: ShUiDialogFooter(
          children: [
            ShUiButton(
              variant: ShUiButtonVariant.secondary,
              onPressed: () => Navigator.pop(context),
              child: const Text('취소'),
            ),
            ShUiButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('저장'),
            ),
          ],
        ),
      ),
    );
  }

  void _showDangerDialog(BuildContext context) {
    ShUiDialog.show(
      context: context,
      builder: (context) => ShUiDialogContent(
        title: const ShUiDialogTitle('계정 삭제'),
        description: const ShUiDialogDescription(
          '정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.',
        ),
        footer: ShUiDialogFooter(
          children: [
            ShUiButton(
              variant: ShUiButtonVariant.secondary,
              onPressed: () => Navigator.pop(context),
              child: const Text('취소'),
            ),
            ShUiButton(
              variant: ShUiButtonVariant.danger,
              onPressed: () => Navigator.pop(context),
              child: const Text('삭제'),
            ),
          ],
        ),
      ),
    );
  }

  void _showCustomContentDialog(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    ShUiDialog.show(
      context: context,
      builder: (context) => ShUiDialogContent(
        title: const ShUiDialogTitle('사용자 정보'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _dialogInfoRow('이름', '홍길동', colors),
            const SizedBox(height: 8),
            _dialogInfoRow('이메일', 'hong@example.com', colors),
            const SizedBox(height: 8),
            _dialogInfoRow('역할', '관리자', colors),
          ],
        ),
        footer: ShUiDialogFooter(
          children: [
            ShUiButton(
              variant: ShUiButtonVariant.secondary,
              onPressed: () => Navigator.pop(context),
              child: const Text('닫기'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _dialogInfoRow(String label, String value, ShUiColorTokens colors) {
    return Row(
      children: [
        SizedBox(
          width: 60,
          child: Text(
            label,
            style: TextStyle(color: colors.foregroundMuted, fontSize: 13),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: colors.foreground,
            fontSize: 13,
            fontWeight: FontWeight.w500,
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
