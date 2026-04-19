import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_accordion.dart';

class AccordionPage extends StatelessWidget {
  const AccordionPage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Accordion', style: TextStyle(color: colors.foreground)),
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
          _section('Multiple (기본)', colors),
          ShUiAccordion(
            initialValue: const ['item-1'],
            items: [
              ShUiAccordionItem(
                value: 'item-1',
                title: '설치 방법이 궁금합니다',
                content: Text(
                  'CLI를 사용하면 "sh-ui add accordion"으로 위젯 파일이 lib/widgets/에 복사됩니다.',
                  style: TextStyle(color: colors.foregroundMuted),
                ),
              ),
              ShUiAccordionItem(
                value: 'item-2',
                title: '테마는 어떻게 바꾸나요?',
                content: Text(
                  'ShUiTheme 토큰을 덮어쓰면 모든 위젯에 일괄 적용됩니다.',
                  style: TextStyle(color: colors.foregroundMuted),
                ),
              ),
              ShUiAccordionItem(
                value: 'item-3',
                title: '접근성은 어떻게 챙겼나요?',
                content: Text(
                  '키보드/포커스 처리는 Flutter의 기본 포커스 트리를 따릅니다.',
                  style: TextStyle(color: colors.foregroundMuted),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          _section('Single (한 번에 하나)', colors),
          ShUiAccordion(
            type: ShUiAccordionType.single,
            initialValue: 'a',
            items: [
              ShUiAccordionItem(
                value: 'a',
                title: '섹션 A',
                content: Text(
                  'A만 열린 상태로 시작합니다. B를 열면 A가 자동으로 닫힙니다.',
                  style: TextStyle(color: colors.foregroundMuted),
                ),
              ),
              ShUiAccordionItem(
                value: 'b',
                title: '섹션 B',
                content: Text(
                  'B를 열면 A·C는 닫힙니다.',
                  style: TextStyle(color: colors.foregroundMuted),
                ),
              ),
              ShUiAccordionItem(
                value: 'c',
                title: '섹션 C',
                content: Text(
                  'C 본문.',
                  style: TextStyle(color: colors.foregroundMuted),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          _section('아이콘 + 비활성화', colors),
          ShUiAccordion(
            items: [
              ShUiAccordionItem(
                value: 'profile',
                title: '프로필 설정',
                leadingIcon: Icons.person_outline,
                content: Text(
                  '계정 정보와 프로필 사진을 변경할 수 있습니다.',
                  style: TextStyle(color: colors.foregroundMuted),
                ),
              ),
              ShUiAccordionItem(
                value: 'billing',
                title: '결제 (준비 중)',
                leadingIcon: Icons.credit_card_outlined,
                disabled: true,
                content: Text(
                  '열리지 않습니다.',
                  style: TextStyle(color: colors.foregroundMuted),
                ),
              ),
              ShUiAccordionItem(
                value: 'notifications',
                title: '알림',
                leadingIcon: Icons.notifications_outlined,
                content: Text(
                  '이메일·푸시 알림 수신 설정.',
                  style: TextStyle(color: colors.foregroundMuted),
                ),
              ),
            ],
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
