import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show Clipboard, ClipboardData;
import '../foundation/sh_ui_tokens.dart';

/// CLI 명령 참고 페이지. showcase는 Flutter 앱이지만 sh-ui CLI는 플랫폼 무관한
/// Node 명령이므로 동일한 참고 자료를 제공한다. 각 명령을 탭하면 클립보드로 복사.
class CliPage extends StatelessWidget {
  const CliPage({super.key});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text(
          'CLI',
          style: TextStyle(
            color: colors.foreground,
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'sh-ui CLI — 설정 파일을 만들고 레지스트리에서 위젯 소스를 프로젝트로 복사. '
          '복사된 코드는 프로젝트의 것이므로 자유롭게 수정 가능.',
          style: TextStyle(color: colors.foregroundMuted, fontSize: 13, height: 1.5),
        ),
        const SizedBox(height: 20),

        _section('1. 설정 파일 생성', colors),
        _CommandBlock(
          command: 'npx sh-ui init',
          description: '플랫폼·토큰 축을 대화형으로 선택하여 sh-ui.config.json 생성.',
        ),
        const SizedBox(height: 8),
        _CommandBlock(
          command:
              'npx sh-ui init --yes --platform flutter --base neutral --radius md --mode light-dark',
          description: '비대화형(CI 등) — 모든 축을 플래그로 지정.',
        ),
        const SizedBox(height: 20),

        _section('2. 토큰 + 위젯 설치', colors),
        _CommandBlock(
          command: 'npx sh-ui add tokens',
          description: '설정 값 기반으로 sh_ui_tokens.dart 생성/갱신.',
        ),
        const SizedBox(height: 8),
        _CommandBlock(
          command: 'npx sh-ui add button card dialog',
          description: '여러 위젯을 한 번에 복사. registryDependencies가 있으면 자동 포함.',
        ),
        const SizedBox(height: 8),
        _CommandBlock(
          command: 'npx sh-ui add dropdown-menu tooltip avatar badge',
          description: '최근 v0.10.0에 추가된 위젯들.',
        ),
        const SizedBox(height: 20),

        _section('3. 관리 명령', colors),
        _CommandBlock(
          command: 'npx sh-ui list',
          description: '현재 설치된 컴포넌트 목록 (`--all`로 설치 가능한 전체 표시).',
        ),
        const SizedBox(height: 8),
        _CommandBlock(
          command: 'npx sh-ui remove button card',
          description: '여러 컴포넌트 파일 한 번에 삭제. 수정한 파일은 건너뜀 (--force로 강제).',
        ),
        const SizedBox(height: 8),
        _CommandBlock(
          command: 'npx sh-ui remove button --dry-run',
          description: '삭제 대상만 확인하고 실제 삭제는 하지 않음.',
        ),
        const SizedBox(height: 20),

        _section('4. 플래그 참고', colors),
        _flagRow('--yes / -y', '프롬프트 없이 기본값으로 진행 (init)', colors),
        _flagRow('--force', 'init: 기존 config 덮어쓰기 / remove: 수정 파일도 삭제', colors),
        _flagRow('--skip-install', '외부 패키지 자동 설치 생략 (add, React 한정)', colors),
        _flagRow('--diff', '파일 쓰지 않고 변경 내역만 출력 (add)', colors),
        _flagRow('--all', '설치되지 않은 컴포넌트까지 표시 (list)', colors),
        _flagRow('--dry-run', '실제 삭제 없이 대상 파일만 출력 (remove)', colors),
        const SizedBox(height: 20),

        _section('Flutter 설정 예시', colors),
        _ConfigBlock(
          content: '''{
  "platform": "flutter",
  "style": "default",
  "theme": {
    "base": "neutral",
    "radius": "md",
    "mode": "light-dark"
  },
  "paths": {
    "tokens": "lib/sh_ui/foundation/sh_ui_tokens.dart",
    "foundation": "lib/sh_ui/foundation",
    "widgets": "lib/sh_ui/widgets"
  }
}''',
        ),
        const SizedBox(height: 20),

        _section('동작 원리', colors),
        Text(
          '• sh-ui는 npm 패키지가 아니라 레지스트리다. 코드가 프로젝트에 복사되고, sh-ui는 '
          '더 이상 의존성이 아니게 된다.\n'
          '• 업데이트는 다시 sh-ui add하면 덮어쓴다 — 수정한 부분은 diff로 확인 후 병합.\n'
          '• 토큰 파일은 선택한 mode(light/dark/light-dark)만큼만 생성된다.',
          style: TextStyle(color: colors.foreground, fontSize: 13, height: 1.6),
        ),
        const SizedBox(height: 12),
        Text(
          '각 명령을 탭하면 클립보드에 복사돼요.',
          style: TextStyle(
            color: colors.foregroundMuted,
            fontSize: 12,
            fontStyle: FontStyle.italic,
          ),
        ),
      ],
    );
  }

  Widget _section(String title, ShUiColorTokens colors) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
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

  Widget _flagRow(String flag, String description, ShUiColorTokens colors) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              flag,
              style: TextStyle(
                color: colors.foreground,
                fontSize: 12,
                fontFamily: 'monospace',
              ),
            ),
          ),
          Expanded(
            child: Text(
              description,
              style: TextStyle(color: colors.foregroundMuted, fontSize: 12, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }
}

class _CommandBlock extends StatelessWidget {
  final String command;
  final String description;

  const _CommandBlock({required this.command, required this.description});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return InkWell(
      borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
      onTap: () async {
        await Clipboard.setData(ClipboardData(text: command));
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('클립보드에 복사됨'),
            duration: Duration(seconds: 2),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: colors.backgroundSubtle,
          border: Border.all(color: colors.border),
          borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.terminal, size: 14, color: colors.foregroundMuted),
                const SizedBox(width: 8),
                Expanded(
                  child: SelectableText(
                    command,
                    style: TextStyle(
                      color: colors.foreground,
                      fontSize: 12,
                      fontFamily: 'monospace',
                      height: 1.4,
                    ),
                  ),
                ),
                Icon(Icons.content_copy, size: 14, color: colors.foregroundMuted),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              description,
              style: TextStyle(
                color: colors.foregroundMuted,
                fontSize: 12,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ConfigBlock extends StatelessWidget {
  final String content;

  const _ConfigBlock({required this.content});

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.backgroundSubtle,
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(shUi.radius.defaultRadius),
      ),
      child: SelectableText(
        content,
        style: TextStyle(
          color: colors.foreground,
          fontSize: 12,
          fontFamily: 'monospace',
          height: 1.5,
        ),
      ),
    );
  }
}
