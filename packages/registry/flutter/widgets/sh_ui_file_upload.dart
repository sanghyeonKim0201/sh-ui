import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// 파일 정보 (플랫폼 독립적).
class ShUiFileInfo {
  final String name;
  final int size;

  const ShUiFileInfo({required this.name, required this.size});
}

/// sh-ui FileUpload — 파일 업로드 UI.
///
/// Flutter에서 실제 파일 선택은 file_picker 등 패키지에 의존한다.
/// 이 위젯은 UI만 제공하며, onPickFiles 콜백으로 파일 선택 로직을 위임한다.
///
/// ShUiFileUpload(
///   files: uploadedFiles,
///   onPickFiles: () async {
///     final result = await FilePicker.platform.pickFiles(allowMultiple: true);
///     if (result != null) {
///       setState(() { uploadedFiles.addAll(result.files.map(...)); });
///     }
///   },
///   onRemove: (index) => setState(() => uploadedFiles.removeAt(index)),
/// )
class ShUiFileUpload extends StatefulWidget {
  final List<ShUiFileInfo> files;
  final VoidCallback? onPickFiles;
  final ValueChanged<int>? onRemove;
  final bool multiple;
  final bool enabled;
  final Widget? placeholder;
  final String? hint;
  final bool showFileList;

  const ShUiFileUpload({
    super.key,
    this.files = const [],
    this.onPickFiles,
    this.onRemove,
    this.multiple = false,
    this.enabled = true,
    this.placeholder,
    this.hint,
    this.showFileList = true,
  });

  @override
  State<ShUiFileUpload> createState() => _ShUiFileUploadState();
}

class _ShUiFileUploadState extends State<ShUiFileUpload> {
  bool _hover = false;

  String _formatBytes(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / 1024 / 1024).toStringAsFixed(1)} MB';
    }
    return '${(bytes / 1024 / 1024 / 1024).toStringAsFixed(1)} GB';
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;
    final disabled = !widget.enabled;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Dropzone
        MouseRegion(
          cursor: disabled ? SystemMouseCursors.basic : SystemMouseCursors.click,
          onEnter: (_) => setState(() => _hover = true),
          onExit: (_) => setState(() => _hover = false),
          child: GestureDetector(
            onTap: disabled ? null : widget.onPickFiles,
            child: Opacity(
              opacity: disabled ? shUi.opacity.disabled : 1,
              child: AnimatedContainer(
                duration: shUi.duration.fast,
                padding:
                    EdgeInsets.symmetric(horizontal: shUi.spacing.s6, vertical: shUi.spacing.s8),
                decoration: BoxDecoration(
                  color: _hover
                      ? colors.backgroundSubtle
                      : colors.background,
                  border: Border.all(
                    color: _hover ? colors.primary : colors.border,
                    width: 1.5,
                  ),
                  borderRadius:
                      BorderRadius.circular(shUi.radius.defaultRadius),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.upload_outlined,
                      size: 28,
                      color: colors.foregroundMuted,
                    ),
                    SizedBox(height: shUi.spacing.s2),
                    widget.placeholder ??
                        Text.rich(
                          TextSpan(children: [
                            TextSpan(
                              text: '파일을 선택',
                              style: TextStyle(
                                fontWeight: shUi.weight.semibold,
                                color: colors.foreground,
                              ),
                            ),
                            TextSpan(
                              text: '하거나 드래그하세요',
                              style: TextStyle(color: colors.foregroundMuted),
                            ),
                          ]),
                          style: TextStyle(fontSize: shUi.text.sm),
                        ),
                    if (widget.hint != null) ...[
                      SizedBox(height: shUi.spacing.s1),
                      Text(
                        widget.hint!,
                        style: TextStyle(
                          color: colors.foregroundMuted,
                          fontSize: shUi.text.xs,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),

        // File list
        if (widget.showFileList && widget.files.isNotEmpty) ...[
          SizedBox(height: shUi.spacing.s2),
          ...List.generate(widget.files.length, (i) {
            final file = widget.files[i];
            return Padding(
              padding: EdgeInsets.only(bottom: shUi.spacing.s1),
              child: Container(
                padding:
                    EdgeInsets.symmetric(horizontal: shUi.spacing.s3, vertical: shUi.spacing.s2),
                decoration: BoxDecoration(
                  color: colors.backgroundSubtle,
                  borderRadius:
                      BorderRadius.circular(shUi.radius.defaultRadius - 2),
                ),
                child: Row(
                  children: [
                    Icon(Icons.insert_drive_file_outlined,
                        size: 16, color: colors.foregroundMuted),
                    SizedBox(width: shUi.spacing.s2),
                    Expanded(
                      child: Text(
                        file.name,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: colors.foreground,
                          fontSize: 13,
                        ),
                      ),
                    ),
                    SizedBox(width: shUi.spacing.s2),
                    Text(
                      _formatBytes(file.size),
                      style: TextStyle(
                        color: colors.foregroundMuted,
                        fontSize: shUi.text.xs,
                      ),
                    ),
                    if (widget.onRemove != null) ...[
                      SizedBox(width: shUi.spacing.s2),
                      GestureDetector(
                        onTap: disabled ? null : () => widget.onRemove!(i),
                        child: Icon(
                          Icons.close,
                          size: 14,
                          color: colors.foregroundMuted,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          }),
        ],
      ],
    );
  }
}
