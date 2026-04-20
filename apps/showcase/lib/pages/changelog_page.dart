import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle, Clipboard, ClipboardData;
import '../foundation/sh_ui_tokens.dart';

/// 단일 소스(packages/changelog/versions.json)를 로드해 릴리즈 목록을 렌더한다.
/// showcase/assets/versions.json은 원본 심볼릭 링크.
class ChangelogPage extends StatefulWidget {
  const ChangelogPage({super.key});

  @override
  State<ChangelogPage> createState() => _ChangelogPageState();
}

class _ChangelogPageState extends State<ChangelogPage> {
  late final Future<List<_VersionEntry>> _futureVersions;

  @override
  void initState() {
    super.initState();
    _futureVersions = _loadVersions();
  }

  Future<List<_VersionEntry>> _loadVersions() async {
    final raw = await rootBundle.loadString('assets/versions.json');
    final decoded = json.decode(raw) as Map<String, dynamic>;
    final list = decoded['versions'] as List<dynamic>;
    return list
        .map((e) => _VersionEntry.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return FutureBuilder<List<_VersionEntry>>(
      future: _futureVersions,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(
            child: Text(
              '변경 내역을 불러오지 못했어요.',
              style: TextStyle(color: colors.foregroundMuted),
            ),
          );
        }
        final versions = snapshot.data ?? const [];
        return ListView.separated(
          padding: const EdgeInsets.all(24),
          itemCount: versions.length + 1,
          separatorBuilder: (_, __) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            if (index == 0) {
              return _Header(colors: colors);
            }
            return _VersionCard(entry: versions[index - 1], colors: colors);
          },
        );
      },
    );
  }
}

class _Header extends StatelessWidget {
  final ShUiColorTokens colors;
  const _Header({required this.colors});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '변경 내역',
          style: TextStyle(
            color: colors.foreground,
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          '릴리즈별 주요 변경 사항. 전체 본문은 각 버전의 GitHub Release에서 확인.',
          style: TextStyle(color: colors.foregroundMuted, fontSize: 13),
        ),
      ],
    );
  }
}

class _VersionCard extends StatelessWidget {
  final _VersionEntry entry;
  final ShUiColorTokens colors;
  const _VersionCard({required this.entry, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.background,
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _VersionBadge(version: entry.version, colors: colors),
              const SizedBox(width: 8),
              _TypeChip(type: entry.type, colors: colors),
              const SizedBox(width: 8),
              Text(
                entry.date,
                style: TextStyle(
                  color: colors.foregroundMuted,
                  fontSize: 12,
                  fontFeatures: const [FontFeature.tabularFigures()],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            entry.title,
            style: TextStyle(
              color: colors.foreground,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          ...entry.highlights.map(
            (h) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 6, right: 8),
                    child: Container(
                      width: 3,
                      height: 3,
                      decoration: BoxDecoration(
                        color: colors.foregroundMuted,
                        borderRadius: BorderRadius.circular(1.5),
                      ),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      h,
                      style: TextStyle(
                        color: colors.foreground,
                        fontSize: 13,
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          _GitHubLink(url: entry.url, colors: colors),
        ],
      ),
    );
  }
}

class _VersionBadge extends StatelessWidget {
  final String version;
  final ShUiColorTokens colors;
  const _VersionBadge({required this.version, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: colors.backgroundMuted,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        'v$version',
        style: TextStyle(
          color: colors.foreground,
          fontSize: 13,
          fontWeight: FontWeight.w600,
          fontFamily: 'monospace',
        ),
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  final String type;
  final ShUiColorTokens colors;
  const _TypeChip({required this.type, required this.colors});

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (type) {
      'major' => (colors.danger, colors.dangerForeground),
      'minor' => (colors.primary, colors.primaryForeground),
      _ => (colors.backgroundMuted, colors.foregroundMuted),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        type.toUpperCase(),
        style: TextStyle(
          color: fg,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}

class _GitHubLink extends StatelessWidget {
  final String url;
  final ShUiColorTokens colors;
  const _GitHubLink({required this.url, required this.colors});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(4),
      onTap: () async {
        await Clipboard.setData(ClipboardData(text: url));
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('링크를 클립보드에 복사했어요: $url'),
            duration: const Duration(seconds: 2),
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.open_in_new, size: 14, color: colors.foregroundMuted),
            const SizedBox(width: 6),
            Text(
              'GitHub 릴리즈 링크 복사',
              style: TextStyle(
                color: colors.foregroundMuted,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VersionEntry {
  final String version;
  final String date;
  final String title;
  final String type;
  final List<String> highlights;
  final String url;

  const _VersionEntry({
    required this.version,
    required this.date,
    required this.title,
    required this.type,
    required this.highlights,
    required this.url,
  });

  factory _VersionEntry.fromJson(Map<String, dynamic> json) {
    return _VersionEntry(
      version: json['version'] as String,
      date: json['date'] as String,
      title: json['title'] as String,
      type: json['type'] as String,
      highlights: (json['highlights'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      url: json['url'] as String,
    );
  }
}
