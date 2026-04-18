import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_card.dart';
import '../widgets/sh_ui_button.dart';

class CardPage extends StatefulWidget {
  const CardPage({super.key});

  @override
  State<CardPage> createState() => _CardPageState();
}

class _CardPageState extends State<CardPage> {
  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Card', style: TextStyle(color: colors.foreground)),
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
          // --- Basic Card ---
          _section('Basic Card', colors),
          ShUiCard(
            children: [
              const ShUiCardHeader(
                title: ShUiCardTitle('카드 제목'),
                description: ShUiCardDescription('카드에 대한 간단한 설명입니다.'),
              ),
              ShUiCardContent(
                child: Text(
                  '카드 본문 영역입니다. 여기에 다양한 컨텐츠를 배치할 수 있습니다.',
                  style: TextStyle(color: colors.foreground, fontSize: 14),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Card with Header Action ---
          _section('With Header Action', colors),
          ShUiCard(
            children: [
              ShUiCardHeader(
                title: const ShUiCardTitle('프로젝트 설정'),
                description: const ShUiCardDescription('프로젝트의 기본 설정을 관리합니다.'),
                action: ShUiButton(
                  variant: ShUiButtonVariant.ghost,
                  size: ShUiButtonSize.sm,
                  onPressed: () {},
                  child: const Text('편집'),
                ),
              ),
              ShUiCardContent(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _detailRow('프로젝트 이름', 'sh-ui', colors),
                    const SizedBox(height: 8),
                    _detailRow('버전', '1.0.0', colors),
                    const SizedBox(height: 8),
                    _detailRow('라이선스', 'MIT', colors),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Card with Footer ---
          _section('With Footer', colors),
          ShUiCard(
            children: [
              const ShUiCardHeader(
                title: ShUiCardTitle('계정 삭제'),
                description:
                    ShUiCardDescription('이 작업은 되돌릴 수 없습니다. 계정과 관련된 모든 데이터가 영구 삭제됩니다.'),
              ),
              ShUiCardFooter(
                children: [
                  ShUiButton(
                    variant: ShUiButtonVariant.secondary,
                    size: ShUiButtonSize.sm,
                    onPressed: () {},
                    child: const Text('취소'),
                  ),
                  ShUiButton(
                    variant: ShUiButtonVariant.danger,
                    size: ShUiButtonSize.sm,
                    onPressed: () {},
                    child: const Text('삭제'),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 24),

          // --- Full Card ---
          _section('Full Card (Header + Content + Footer)', colors),
          ShUiCard(
            children: [
              ShUiCardHeader(
                title: const ShUiCardTitle('알림 설정'),
                description: const ShUiCardDescription('알림 수신 방법을 선택하세요.'),
                action: ShUiButton(
                  variant: ShUiButtonVariant.link,
                  size: ShUiButtonSize.sm,
                  onPressed: () {},
                  child: const Text('초기화'),
                ),
              ),
              ShUiCardContent(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _checkItem('이메일 알림', true, colors),
                    const SizedBox(height: 8),
                    _checkItem('푸시 알림', true, colors),
                    const SizedBox(height: 8),
                    _checkItem('SMS 알림', false, colors),
                  ],
                ),
              ),
              ShUiCardFooter(
                children: [
                  ShUiButton(
                    variant: ShUiButtonVariant.primary,
                    size: ShUiButtonSize.sm,
                    onPressed: () {},
                    child: const Text('저장'),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value, ShUiColorTokens colors) {
    return Row(
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: 13,
            ),
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

  Widget _checkItem(String label, bool checked, ShUiColorTokens colors) {
    return Row(
      children: [
        Icon(
          checked ? Icons.check_box : Icons.check_box_outline_blank,
          size: 18,
          color: checked ? colors.primary : colors.foregroundMuted,
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(color: colors.foreground, fontSize: 14),
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
