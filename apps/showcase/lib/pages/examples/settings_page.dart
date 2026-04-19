import 'package:flutter/material.dart';
import '../../foundation/sh_ui_tokens.dart';
import '../../widgets/sh_ui_button.dart';
import '../../widgets/sh_ui_card.dart';
import '../../widgets/sh_ui_checkbox.dart';
import '../../widgets/sh_ui_radio.dart';
import '../../widgets/sh_ui_select.dart';
import '../../widgets/sh_ui_switch.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _emailNotify = true;
  bool _pushNotify = false;
  String _language = 'ko';

  String _themeMode = 'system';
  String _accent = 'neutral';

  bool _profilePublic = true;
  bool _marketingOptIn = false;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 720),
        child: ListView(
          padding: EdgeInsets.all(shUi.spacing.s6),
          children: [
              // === 계정 ===
              ShUiCard(children: [
                const ShUiCardHeader(
                  title: ShUiCardTitle('계정'),
                  description:
                      ShUiCardDescription('알림 및 언어 기본 설정을 관리합니다.'),
                ),
                ShUiCardContent(
                  child: Column(
                    children: [
                      _settingRow(
                        shUi,
                        title: '이메일 알림',
                        subtitle: '주간 리포트와 중요 공지를 이메일로 받습니다.',
                        trailing: ShUiSwitch(
                          checked: _emailNotify,
                          onChanged: (v) =>
                              setState(() => _emailNotify = v),
                        ),
                      ),
                      _divider(shUi),
                      _settingRow(
                        shUi,
                        title: '푸시 알림',
                        subtitle: '브라우저 푸시로 실시간 업데이트를 받습니다.',
                        trailing: ShUiSwitch(
                          checked: _pushNotify,
                          onChanged: (v) =>
                              setState(() => _pushNotify = v),
                        ),
                      ),
                      _divider(shUi),
                      _settingRow(
                        shUi,
                        title: '언어',
                        subtitle: '인터페이스 표시 언어를 선택합니다.',
                        trailing: SizedBox(
                          width: 160,
                          child: ShUiSelect<String>(
                            value: _language,
                            onChanged: (v) => setState(
                                () => _language = v ?? _language),
                            items: const [
                              ShUiSelectItem(
                                  value: 'ko', child: Text('한국어')),
                              ShUiSelectItem(
                                  value: 'en', child: Text('English')),
                              ShUiSelectItem(
                                  value: 'ja', child: Text('日本語')),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ]),
              SizedBox(height: shUi.spacing.s5),

              // === 테마 ===
              ShUiCard(children: [
                const ShUiCardHeader(
                  title: ShUiCardTitle('테마'),
                  description:
                      ShUiCardDescription('색상과 모드를 원하는 대로 조정합니다.'),
                ),
                ShUiCardContent(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '테마 모드',
                        style: TextStyle(
                          color: colors.foreground,
                          fontSize: shUi.text.sm,
                          fontWeight: shUi.weight.medium,
                        ),
                      ),
                      SizedBox(height: shUi.spacing.s3),
                      ShUiRadioGroup(
                        children: [
                          _radioRow(shUi, 'light', '라이트',
                              '밝은 배경에 어두운 텍스트'),
                          _radioRow(shUi, 'dark', '다크',
                              '어두운 배경에 밝은 텍스트'),
                          _radioRow(shUi, 'system', '시스템',
                              'OS 설정을 따릅니다'),
                        ],
                      ),
                      SizedBox(height: shUi.spacing.s5),
                      _settingRow(
                        shUi,
                        title: '강조 색상',
                        subtitle: '버튼, 링크 등에 사용됩니다.',
                        trailing: SizedBox(
                          width: 160,
                          child: ShUiSelect<String>(
                            value: _accent,
                            onChanged: (v) => setState(
                                () => _accent = v ?? _accent),
                            items: const [
                              ShUiSelectItem(
                                  value: 'neutral',
                                  child: Text('뉴트럴')),
                              ShUiSelectItem(
                                  value: 'blue', child: Text('블루')),
                              ShUiSelectItem(
                                  value: 'green', child: Text('그린')),
                              ShUiSelectItem(
                                  value: 'violet',
                                  child: Text('바이올렛')),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ]),
              SizedBox(height: shUi.spacing.s5),

              // === 개인정보 ===
              ShUiCard(children: [
                const ShUiCardHeader(
                  title: ShUiCardTitle('개인정보'),
                  description: ShUiCardDescription(
                      '프로필 공개 범위와 수신 설정을 관리합니다.'),
                ),
                ShUiCardContent(
                  child: Column(
                    children: [
                      _settingRow(
                        shUi,
                        title: '프로필 공개',
                        subtitle: '다른 사용자가 프로필을 볼 수 있습니다.',
                        trailing: ShUiSwitch(
                          checked: _profilePublic,
                          onChanged: (v) =>
                              setState(() => _profilePublic = v),
                        ),
                      ),
                      _divider(shUi),
                      Row(
                        children: [
                          ShUiCheckbox(
                            checked: _marketingOptIn,
                            onChanged: (v) => setState(
                                () => _marketingOptIn = v),
                          ),
                          SizedBox(width: shUi.spacing.s3),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '마케팅 수신',
                                  style: TextStyle(
                                    color: colors.foreground,
                                    fontSize: shUi.text.sm,
                                    fontWeight: shUi.weight.medium,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  '신제품, 이벤트 정보를 이메일로 받습니다.',
                                  style: TextStyle(
                                    color: colors.foregroundMuted,
                                    fontSize: shUi.text.xs,
                                    height: 1.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ]),
              SizedBox(height: shUi.spacing.s5),

              // === 위험 구역 ===
              ShUiCard(children: [
                const ShUiCardHeader(
                  title: ShUiCardTitle('위험 구역'),
                  description: ShUiCardDescription(
                      '아래 작업은 되돌릴 수 없습니다. 신중히 진행해주세요.'),
                ),
                ShUiCardContent(
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '계정 삭제',
                              style: TextStyle(
                                color: colors.foreground,
                                fontSize: shUi.text.sm,
                                fontWeight: shUi.weight.medium,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              '계정과 모든 연결된 데이터가 영구적으로 삭제됩니다.',
                              style: TextStyle(
                                color: colors.foregroundMuted,
                                fontSize: shUi.text.xs,
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(width: shUi.spacing.s4),
                      ShUiButton(
                        variant: ShUiButtonVariant.danger,
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text('확인 창을 표시합니다.')),
                          );
                        },
                        child: const Text('계정 삭제'),
                      ),
                    ],
                  ),
                ),
              ]),
              SizedBox(height: shUi.spacing.s8),
            ],
          ),
        ),
    );
  }

  Widget _settingRow(
    ShUiTheme shUi, {
    required String title,
    String? subtitle,
    required Widget trailing,
  }) {
    final colors = shUi.colors;
    return Padding(
      padding: EdgeInsets.symmetric(vertical: shUi.spacing.s2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: shUi.text.sm,
                    fontWeight: shUi.weight.medium,
                  ),
                ),
                if (subtitle != null) ...[
                  SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: colors.foregroundMuted,
                      fontSize: shUi.text.xs,
                      height: 1.5,
                    ),
                  ),
                ],
              ],
            ),
          ),
          SizedBox(width: shUi.spacing.s4),
          trailing,
        ],
      ),
    );
  }

  Widget _radioRow(
    ShUiTheme shUi,
    String value,
    String title,
    String subtitle,
  ) {
    final colors = shUi.colors;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => setState(() => _themeMode = value),
      child: Row(
        children: [
          ShUiRadio<String>(
            value: value,
            groupValue: _themeMode,
            onChanged: (v) => setState(() => _themeMode = v),
          ),
          SizedBox(width: shUi.spacing.s3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: shUi.text.sm,
                    fontWeight: shUi.weight.medium,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: colors.foregroundMuted,
                    fontSize: shUi.text.xs,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider(ShUiTheme shUi) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: shUi.spacing.s2),
      child: Container(height: 1, color: shUi.colors.border),
    );
  }
}
