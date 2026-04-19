import 'package:flutter/material.dart';
import '../../foundation/sh_ui_tokens.dart';
import '../../widgets/sh_ui_button.dart';
import '../../widgets/sh_ui_checkbox.dart';
import '../../widgets/sh_ui_input.dart';
import '../../widgets/sh_ui_label.dart';
import '../../widgets/sh_ui_select.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  String _phone = '';
  String _brn = '';
  List<String> _interests = [];
  bool _agreeTerms = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool get _canSubmit => _agreeTerms;

  void _handleSubmit() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('가입 요청이 전송되었습니다.')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 560),
        child: ListView(
          padding: EdgeInsets.all(shUi.spacing.s6),
          children: [
              Text(
                '계정 만들기',
                style: TextStyle(
                  color: colors.foreground,
                  fontSize: shUi.text.xl2,
                  fontWeight: shUi.weight.bold,
                  letterSpacing: -0.5,
                ),
              ),
              SizedBox(height: shUi.spacing.s2),
              Text(
                '사업자 계정 신청을 위해 아래 정보를 입력해주세요.',
                style: TextStyle(
                  color: colors.foregroundMuted,
                  fontSize: shUi.text.sm,
                  height: 1.5,
                ),
              ),
              SizedBox(height: shUi.spacing.s8),

              _fieldLabel(
                shUi,
                title: '이름',
                required: true,
                child: ShUiInput(
                  controller: _nameController,
                  placeholder: '홍길동',
                  onChanged: (_) => setState(() {}),
                ),
              ),
              SizedBox(height: shUi.spacing.s5),

              _fieldLabel(
                shUi,
                title: '이메일',
                required: true,
                description: '로그인 및 알림 수신에 사용됩니다.',
                child: ShUiInput(
                  controller: _emailController,
                  placeholder: 'name@company.com',
                  keyboardType: TextInputType.emailAddress,
                  onChanged: (_) => setState(() {}),
                ),
              ),
              SizedBox(height: shUi.spacing.s5),

              _fieldLabel(
                shUi,
                title: '비밀번호',
                required: true,
                description: '영문, 숫자, 특수문자 포함 8자 이상',
                child: ShUiInput(
                  controller: _passwordController,
                  placeholder: '비밀번호 입력',
                  obscureText: true,
                  onChanged: (_) => setState(() {}),
                ),
              ),
              SizedBox(height: shUi.spacing.s5),

              _fieldLabel(
                shUi,
                title: '전화번호',
                required: true,
                child: ShUiPhoneInput(
                  placeholder: '010-0000-0000',
                  onChanged: (v) => setState(() => _phone = v),
                ),
              ),
              SizedBox(height: shUi.spacing.s5),

              _fieldLabel(
                shUi,
                title: '사업자등록번호',
                description: '10자리를 입력하면 자동으로 검증합니다.',
                child: ShUiBusinessNumberInput(
                  placeholder: '000-00-00000',
                  validateChecksum: true,
                  onChanged: (v) => setState(() => _brn = v),
                ),
              ),
              SizedBox(height: shUi.spacing.s5),

              _fieldLabel(
                shUi,
                title: '관심사',
                description: '관심 있는 분야를 모두 선택해주세요.',
                child: ShUiMultiSelect<String>(
                  value: _interests,
                  onChanged: (v) => setState(() => _interests = v),
                  placeholder: '관심사 선택',
                  elements: const [
                    ShUiSelectItem(value: 'dev', child: Text('개발')),
                    ShUiSelectItem(value: 'design', child: Text('디자인')),
                    ShUiSelectItem(value: 'marketing', child: Text('마케팅')),
                    ShUiSelectItem(value: 'planning', child: Text('기획')),
                  ],
                ),
              ),
              SizedBox(height: shUi.spacing.s6),

              Container(
                padding: EdgeInsets.all(shUi.spacing.s4),
                decoration: BoxDecoration(
                  color: colors.backgroundSubtle,
                  border: Border.all(color: colors.border),
                  borderRadius:
                      BorderRadius.circular(shUi.radius.defaultRadius),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: ShUiCheckbox(
                        checked: _agreeTerms,
                        onChanged: (v) =>
                            setState(() => _agreeTerms = v),
                      ),
                    ),
                    SizedBox(width: shUi.spacing.s3),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '이용약관 및 개인정보처리방침에 동의합니다',
                            style: TextStyle(
                              color: colors.foreground,
                              fontSize: shUi.text.sm,
                              fontWeight: shUi.weight.medium,
                            ),
                          ),
                          SizedBox(height: shUi.spacing.s1),
                          Text(
                            '가입하려면 필수 약관에 동의해야 합니다.',
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
              ),
              SizedBox(height: shUi.spacing.s6),

              SizedBox(
                width: double.infinity,
                child: ShUiButton(
                  variant: ShUiButtonVariant.primary,
                  size: ShUiButtonSize.lg,
                  onPressed: _canSubmit ? _handleSubmit : null,
                  child: const Text('가입하기'),
                ),
              ),
              SizedBox(height: shUi.spacing.s4),

              // 디버그 미리보기 — 입력된 값 요약
              if (_phone.isNotEmpty ||
                  _brn.isNotEmpty ||
                  _interests.isNotEmpty)
                Container(
                  padding: EdgeInsets.all(shUi.spacing.s3),
                  decoration: BoxDecoration(
                    color: colors.backgroundMuted,
                    borderRadius:
                        BorderRadius.circular(shUi.radius.defaultRadius),
                  ),
                  child: Text(
                    [
                      if (_phone.isNotEmpty) '전화: $_phone',
                      if (_brn.isNotEmpty) '사업자: $_brn',
                      if (_interests.isNotEmpty)
                        '관심사: ${_interests.join(', ')}',
                    ].join('  ·  '),
                    style: TextStyle(
                      color: colors.foregroundMuted,
                      fontSize: shUi.text.xs,
                      height: 1.5,
                    ),
                  ),
                ),
            ],
          ),
        ),
    );
  }

  Widget _fieldLabel(
    ShUiTheme shUi, {
    required String title,
    bool required = false,
    String? description,
    required Widget child,
  }) {
    return ShUiLabel(
      isRequired: required,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShUiLabelTitle(title),
          if (description != null) ...[
            SizedBox(height: shUi.spacing.s1),
            ShUiLabelDescription(description),
          ],
          SizedBox(height: shUi.spacing.s2),
          child,
        ],
      ),
    );
  }
}
