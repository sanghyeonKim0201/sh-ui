import 'package:flutter/material.dart';
import '../../foundation/sh_ui_tokens.dart';
import '../../widgets/sh_ui_button.dart';
import '../../widgets/sh_ui_checkbox.dart';
import '../../widgets/sh_ui_input.dart';
import '../../widgets/sh_ui_label.dart';
import 'signup_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = true;
  bool _submitting = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool get _canSubmit =>
      _emailController.text.trim().isNotEmpty &&
      _passwordController.text.isNotEmpty &&
      !_submitting;

  Future<void> _handleLogin() async {
    setState(() {
      _submitting = true;
      _errorMessage = null;
    });
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() {
      _submitting = false;
      _errorMessage = '이메일 또는 비밀번호를 확인해주세요.';
    });
  }

  void _goToSignup() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const SignupPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Center(
      child: SingleChildScrollView(
        padding: EdgeInsets.all(shUi.spacing.s6),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Container(
              padding: EdgeInsets.all(shUi.spacing.s8),
              decoration: BoxDecoration(
                color: colors.background,
                border: Border.all(color: colors.border),
                borderRadius:
                    BorderRadius.circular(shUi.radius.defaultRadius),
                boxShadow: shUi.shadow.md,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.hexagon_outlined,
                    size: 40,
                    color: colors.foreground,
                  ),
                  SizedBox(height: shUi.spacing.s4),
                  Text(
                    'sh-ui에 로그인',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: colors.foreground,
                      fontSize: shUi.text.xl2,
                      fontWeight: shUi.weight.bold,
                      letterSpacing: -0.5,
                    ),
                  ),
                  SizedBox(height: shUi.spacing.s2),
                  Text(
                    '계정에 로그인하여 작업을 이어가세요',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: colors.foregroundMuted,
                      fontSize: shUi.text.sm,
                      height: 1.5,
                    ),
                  ),
                  SizedBox(height: shUi.spacing.s8),
                  ShUiLabel(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const ShUiLabelTitle('이메일'),
                        SizedBox(height: shUi.spacing.s2),
                        ShUiInput(
                          controller: _emailController,
                          placeholder: '이메일',
                          keyboardType: TextInputType.emailAddress,
                          prefix: const Icon(Icons.mail_outline),
                          onChanged: (_) => setState(() {}),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: shUi.spacing.s4),
                  ShUiLabel(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const ShUiLabelTitle('비밀번호'),
                        SizedBox(height: shUi.spacing.s2),
                        ShUiInput(
                          controller: _passwordController,
                          placeholder: '비밀번호',
                          obscureText: true,
                          prefix: const Icon(Icons.lock_outline),
                          onChanged: (_) => setState(() {}),
                          onSubmitted: (_) {
                            if (_canSubmit) _handleLogin();
                          },
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: shUi.spacing.s4),
                  Row(
                    children: [
                      ShUiCheckbox(
                        checked: _rememberMe,
                        onChanged: (v) =>
                            setState(() => _rememberMe = v),
                      ),
                      SizedBox(width: shUi.spacing.s2),
                      Text(
                        '로그인 상태 유지',
                        style: TextStyle(
                          color: colors.foreground,
                          fontSize: shUi.text.sm,
                        ),
                      ),
                      const Spacer(),
                      ShUiButton(
                        variant: ShUiButtonVariant.link,
                        onPressed: () {},
                        child: const Text('비밀번호 찾기'),
                      ),
                    ],
                  ),
                  if (_errorMessage != null) ...[
                    SizedBox(height: shUi.spacing.s3),
                    Container(
                      padding: EdgeInsets.all(shUi.spacing.s3),
                      decoration: BoxDecoration(
                        color: colors.danger.withValues(alpha: 0.08),
                        border: Border.all(
                          color: colors.danger.withValues(alpha: 0.3),
                        ),
                        borderRadius: BorderRadius.circular(
                            shUi.radius.defaultRadius),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.error_outline,
                              size: 16, color: colors.danger),
                          SizedBox(width: shUi.spacing.s2),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: TextStyle(
                                color: colors.danger,
                                fontSize: shUi.text.sm,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  SizedBox(height: shUi.spacing.s6),
                  ShUiButton(
                    variant: ShUiButtonVariant.primary,
                    size: ShUiButtonSize.lg,
                    onPressed: _canSubmit ? _handleLogin : null,
                    child: Text(_submitting ? '로그인 중...' : '로그인'),
                  ),
                  SizedBox(height: shUi.spacing.s4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '아직 계정이 없으신가요?',
                        style: TextStyle(
                          color: colors.foregroundMuted,
                          fontSize: shUi.text.sm,
                        ),
                      ),
                      SizedBox(width: shUi.spacing.s1),
                      GestureDetector(
                        onTap: _goToSignup,
                        child: MouseRegion(
                          cursor: SystemMouseCursors.click,
                          child: Text(
                            '회원가입',
                            style: TextStyle(
                              color: colors.foreground,
                              fontSize: shUi.text.sm,
                              fontWeight: shUi.weight.semibold,
                              decoration: TextDecoration.underline,
                              decorationColor: colors.foreground,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
    );
  }
}
