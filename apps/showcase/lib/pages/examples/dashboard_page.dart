import 'package:flutter/material.dart';
import '../../foundation/sh_ui_tokens.dart';
import '../../widgets/sh_ui_accordion.dart';
import '../../widgets/sh_ui_button.dart';
import '../../widgets/sh_ui_card.dart';
import '../../widgets/sh_ui_skeleton.dart';
import '../../widgets/sh_ui_tabs.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  bool _reportLoading = true;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _reportLoading = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: EdgeInsets.all(shUi.spacing.s6),
      children: [
          // === 타이틀 ===
          Text(
            '오늘의 개요',
            style: TextStyle(
              color: colors.foreground,
              fontSize: shUi.text.xl2,
              fontWeight: shUi.weight.bold,
              letterSpacing: -0.5,
            ),
          ),
          SizedBox(height: shUi.spacing.s1),
          Text(
            '2026년 4월 18일 · 실시간 데이터',
            style: TextStyle(
              color: colors.foregroundMuted,
              fontSize: shUi.text.sm,
            ),
          ),
          SizedBox(height: shUi.spacing.s6),

          // === 스탯 카드 ===
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 720;
              final columns = isWide ? 4 : 2;
              final stats = _statItems();
              final rows = <Widget>[];
              for (var i = 0; i < stats.length; i += columns) {
                final rowItems = stats.skip(i).take(columns).toList();
                rows.add(Row(
                  children: [
                    for (var j = 0; j < rowItems.length; j++) ...[
                      if (j > 0) SizedBox(width: shUi.spacing.s4),
                      Expanded(child: rowItems[j]),
                    ],
                    // padding to fill row if last row has fewer items
                    for (var k = rowItems.length; k < columns; k++) ...[
                      SizedBox(width: shUi.spacing.s4),
                      const Expanded(child: SizedBox.shrink()),
                    ],
                  ],
                ));
                if (i + columns < stats.length) {
                  rows.add(SizedBox(height: shUi.spacing.s4));
                }
              }
              return Column(children: rows);
            },
          ),
          SizedBox(height: shUi.spacing.s6),

          // === 탭 ===
          ShUiCard(children: [
            ShUiCardContent(
              child: ShUiTabs(
                variant: ShUiTabsVariant.underline,
                tabs: [
                  ShUiTab(
                    label: '개요',
                    child: _overviewTab(shUi),
                  ),
                  ShUiTab(
                    label: '매출',
                    child: _revenueTab(shUi),
                  ),
                  ShUiTab(
                    label: '사용자',
                    child: _usersTab(shUi),
                  ),
                ],
              ),
            ),
          ]),
          SizedBox(height: shUi.spacing.s6),

          // === 최근 활동 Accordion ===
          Text(
            '최근 활동',
            style: TextStyle(
              color: colors.foreground,
              fontSize: shUi.text.lg,
              fontWeight: shUi.weight.semibold,
              letterSpacing: -0.3,
            ),
          ),
          SizedBox(height: shUi.spacing.s3),
          ShUiAccordion(
            type: ShUiAccordionType.single,
            initialValue: 'a1',
            items: [
              ShUiAccordionItem(
                value: 'a1',
                title: '새 주문 #1243 — 김민수',
                leadingIcon: Icons.shopping_bag_outlined,
                content: _activityBody(
                  shUi,
                  '결제 완료 · ₩128,000 · 5분 전',
                  '상품 3건이 포함된 주문이 접수되었습니다. 발송 준비가 필요합니다.',
                ),
              ),
              ShUiAccordionItem(
                value: 'a2',
                title: '결제 환불 요청 — 이서연',
                leadingIcon: Icons.undo_outlined,
                content: _activityBody(
                  shUi,
                  '요청 접수 · ₩24,900 · 22분 전',
                  '고객이 상품 불량을 사유로 환불을 요청했습니다. 확인이 필요합니다.',
                ),
              ),
              ShUiAccordionItem(
                value: 'a3',
                title: '신규 회원가입 — 박준호',
                leadingIcon: Icons.person_add_alt,
                content: _activityBody(
                  shUi,
                  '회원가입 완료 · 1시간 전',
                  '사업자 계정으로 가입했습니다. 승인 절차가 필요합니다.',
                ),
              ),
            ],
          ),
          SizedBox(height: shUi.spacing.s8),
        ],
    );
  }

  // === 스탯 카드 ===
  List<Widget> _statItems() {
    return const [
      _StatCard(
        icon: Icons.groups_outlined,
        value: '1,234',
        label: '오늘 방문자',
        delta: '+12.4%',
        positive: true,
      ),
      _StatCard(
        icon: Icons.attach_money,
        value: '₩3.2M',
        label: '오늘 매출',
        delta: '+4.8%',
        positive: true,
      ),
      _StatCard(
        icon: Icons.shopping_cart_outlined,
        value: '87',
        label: '신규 주문',
        delta: '-2.1%',
        positive: false,
      ),
      _StatCard(
        icon: Icons.percent,
        value: '3.24%',
        label: '전환율',
        delta: '+0.3%p',
        positive: true,
      ),
    ];
  }

  // === 탭 콘텐츠 ===
  Widget _overviewTab(ShUiTheme shUi) {
    return Padding(
      padding: EdgeInsets.only(top: shUi.spacing.s5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '주간 리포트',
            style: TextStyle(
              color: shUi.colors.foreground,
              fontSize: shUi.text.base,
              fontWeight: shUi.weight.semibold,
            ),
          ),
          SizedBox(height: shUi.spacing.s2),
          Text(
            '지난 7일간의 핵심 지표 요약',
            style: TextStyle(
              color: shUi.colors.foregroundMuted,
              fontSize: shUi.text.sm,
            ),
          ),
          SizedBox(height: shUi.spacing.s4),
          if (_reportLoading) ...[
            ShUiSkeleton.block(height: 140),
            SizedBox(height: shUi.spacing.s3),
            ShUiSkeleton.text(width: 240),
            SizedBox(height: shUi.spacing.s2),
            ShUiSkeleton.text(width: 180),
          ] else ...[
            _bulletRow(shUi, '총 방문자 수', '8,432명 (+7.2%)'),
            SizedBox(height: shUi.spacing.s2),
            _bulletRow(shUi, '신규 가입', '312명 (+14.1%)'),
            SizedBox(height: shUi.spacing.s2),
            _bulletRow(shUi, '재방문율', '42.8% (+1.3%p)'),
            SizedBox(height: shUi.spacing.s2),
            _bulletRow(shUi, '평균 세션 시간', '4분 12초 (+18초)'),
          ],
        ],
      ),
    );
  }

  Widget _revenueTab(ShUiTheme shUi) {
    final colors = shUi.colors;
    final rows = [
      ('티셔츠 (오버핏)', '₩1,240,000', 94),
      ('백팩 (데일리)', '₩890,000', 68),
      ('스니커즈 (코어)', '₩640,000', 48),
      ('모자 (볼캡)', '₩310,000', 24),
      ('양말 (3종 세트)', '₩120,000', 9),
    ];
    return Padding(
      padding: EdgeInsets.only(top: shUi.spacing.s5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '품목별 매출 TOP 5',
            style: TextStyle(
              color: colors.foreground,
              fontSize: shUi.text.base,
              fontWeight: shUi.weight.semibold,
            ),
          ),
          SizedBox(height: shUi.spacing.s4),
          for (final r in rows) ...[
            _revenueRow(shUi, r.$1, r.$2, r.$3),
            SizedBox(height: shUi.spacing.s3),
          ],
        ],
      ),
    );
  }

  Widget _usersTab(ShUiTheme shUi) {
    final colors = shUi.colors;
    final rows = [
      ('김민수', 'minsu@acme.co.kr', '관리자', '방금 전'),
      ('이서연', 'seoyeon@design.io', '편집자', '15분 전'),
      ('박준호', 'junho@startup.kr', '뷰어', '1시간 전'),
      ('최은지', 'eunji@company.com', '편집자', '3시간 전'),
    ];
    return Padding(
      padding: EdgeInsets.only(top: shUi.spacing.s5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '최근 접속한 사용자',
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: shUi.text.base,
                    fontWeight: shUi.weight.semibold,
                  ),
                ),
              ),
              ShUiButton(
                variant: ShUiButtonVariant.link,
                onPressed: () {},
                child: const Text('전체 보기'),
              ),
            ],
          ),
          SizedBox(height: shUi.spacing.s4),
          for (var i = 0; i < rows.length; i++) ...[
            _userRow(shUi, rows[i].$1, rows[i].$2, rows[i].$3, rows[i].$4),
            if (i != rows.length - 1) ...[
              SizedBox(height: shUi.spacing.s2),
              Container(height: 1, color: colors.border),
              SizedBox(height: shUi.spacing.s2),
            ],
          ],
        ],
      ),
    );
  }

  // === 헬퍼 ===
  Widget _bulletRow(ShUiTheme shUi, String label, String value) {
    final colors = shUi.colors;
    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(
            color: colors.foreground,
            shape: BoxShape.circle,
          ),
        ),
        SizedBox(width: shUi.spacing.s3),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              color: colors.foreground,
              fontSize: shUi.text.sm,
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: colors.foregroundMuted,
            fontSize: shUi.text.sm,
            fontWeight: shUi.weight.medium,
          ),
        ),
      ],
    );
  }

  Widget _revenueRow(
      ShUiTheme shUi, String name, String amount, int pct) {
    final colors = shUi.colors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                name,
                style: TextStyle(
                  color: colors.foreground,
                  fontSize: shUi.text.sm,
                  fontWeight: shUi.weight.medium,
                ),
              ),
            ),
            Text(
              amount,
              style: TextStyle(
                color: colors.foreground,
                fontSize: shUi.text.sm,
                fontWeight: shUi.weight.semibold,
              ),
            ),
          ],
        ),
        SizedBox(height: shUi.spacing.s2),
        Stack(
          children: [
            Container(
              height: 6,
              decoration: BoxDecoration(
                color: colors.backgroundMuted,
                borderRadius:
                    BorderRadius.circular(shUi.radius.defaultRadius),
              ),
            ),
            FractionallySizedBox(
              widthFactor: pct / 100,
              child: Container(
                height: 6,
                decoration: BoxDecoration(
                  color: colors.foreground,
                  borderRadius:
                      BorderRadius.circular(shUi.radius.defaultRadius),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _userRow(
    ShUiTheme shUi,
    String name,
    String email,
    String role,
    String when,
  ) {
    final colors = shUi.colors;
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: colors.backgroundMuted,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            name.substring(0, 1),
            style: TextStyle(
              color: colors.foreground,
              fontSize: shUi.text.sm,
              fontWeight: shUi.weight.semibold,
            ),
          ),
        ),
        SizedBox(width: shUi.spacing.s3),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: TextStyle(
                  color: colors.foreground,
                  fontSize: shUi.text.sm,
                  fontWeight: shUi.weight.medium,
                ),
              ),
              SizedBox(height: 2),
              Text(
                email,
                style: TextStyle(
                  color: colors.foregroundMuted,
                  fontSize: shUi.text.xs,
                ),
              ),
            ],
          ),
        ),
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: shUi.spacing.s2,
            vertical: 2,
          ),
          decoration: BoxDecoration(
            color: colors.backgroundMuted,
            borderRadius:
                BorderRadius.circular(shUi.radius.defaultRadius),
          ),
          child: Text(
            role,
            style: TextStyle(
              color: colors.foreground,
              fontSize: shUi.text.xs,
              fontWeight: shUi.weight.medium,
            ),
          ),
        ),
        SizedBox(width: shUi.spacing.s3),
        Text(
          when,
          style: TextStyle(
            color: colors.foregroundMuted,
            fontSize: shUi.text.xs,
          ),
        ),
      ],
    );
  }

  Widget _activityBody(ShUiTheme shUi, String meta, String description) {
    final colors = shUi.colors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          meta,
          style: TextStyle(
            color: colors.foregroundMuted,
            fontSize: shUi.text.xs,
            fontWeight: shUi.weight.medium,
          ),
        ),
        SizedBox(height: shUi.spacing.s2),
        Text(
          description,
          style: TextStyle(
            color: colors.foreground,
            fontSize: shUi.text.sm,
            height: 1.5,
          ),
        ),
        SizedBox(height: shUi.spacing.s3),
        Row(
          children: [
            ShUiButton(
              variant: ShUiButtonVariant.secondary,
              size: ShUiButtonSize.sm,
              onPressed: () {},
              child: const Text('자세히'),
            ),
            SizedBox(width: shUi.spacing.s2),
            ShUiButton(
              variant: ShUiButtonVariant.ghost,
              size: ShUiButtonSize.sm,
              onPressed: () {},
              child: const Text('무시'),
            ),
          ],
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final String delta;
  final bool positive;

  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.delta,
    required this.positive,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final deltaColor = positive ? colors.foreground : colors.danger;

    return ShUiCard(children: [
      ShUiCardContent(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: colors.backgroundMuted,
                    borderRadius: BorderRadius.circular(
                        shUi.radius.defaultRadius),
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    icon,
                    size: 18,
                    color: colors.foreground,
                  ),
                ),
                const Spacer(),
                Text(
                  delta,
                  style: TextStyle(
                    color: deltaColor,
                    fontSize: shUi.text.xs,
                    fontWeight: shUi.weight.semibold,
                  ),
                ),
              ],
            ),
            SizedBox(height: shUi.spacing.s4),
            Text(
              value,
              style: TextStyle(
                color: colors.foreground,
                fontSize: shUi.text.xl2,
                fontWeight: shUi.weight.bold,
                letterSpacing: -0.5,
                height: 1.1,
              ),
            ),
            SizedBox(height: shUi.spacing.s1),
            Text(
              label,
              style: TextStyle(
                color: colors.foregroundMuted,
                fontSize: shUi.text.sm,
              ),
            ),
          ],
        ),
      ),
    ]);
  }
}
