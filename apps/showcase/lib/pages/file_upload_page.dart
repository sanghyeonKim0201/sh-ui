import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_file_upload.dart';

class FileUploadPage extends StatefulWidget {
  const FileUploadPage({super.key});

  @override
  State<FileUploadPage> createState() => _FileUploadPageState();
}

class _FileUploadPageState extends State<FileUploadPage> {
  final List<ShUiFileInfo> _files = [];
  final List<ShUiFileInfo> _disabledFiles = [
    const ShUiFileInfo(name: 'report.pdf', size: 2048000),
  ];
  int _mockCounter = 0;

  void _addMockFile() {
    _mockCounter++;
    setState(() {
      _files.add(ShUiFileInfo(
        name: 'document_$_mockCounter.png',
        size: (512 + _mockCounter * 256) * 1024,
      ));
    });
  }

  void _addMultipleMockFiles() {
    _mockCounter++;
    setState(() {
      _files.addAll([
        ShUiFileInfo(
          name: 'photo_$_mockCounter.jpg',
          size: (1024 + _mockCounter * 128) * 1024,
        ),
        ShUiFileInfo(
          name: 'data_$_mockCounter.csv',
          size: (64 + _mockCounter * 32) * 1024,
        ),
      ]);
    });
  }

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title:
            Text('File Upload', style: TextStyle(color: colors.foreground)),
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
          // --- Basic ---
          _section('Basic (Single File)', colors),
          ShUiFileUpload(
            files: _files,
            onPickFiles: _addMockFile,
            onRemove: (i) => setState(() => _files.removeAt(i)),
            hint: 'PNG, JPG -- 최대 5MB',
          ),

          const SizedBox(height: 24),

          // --- Multiple Files ---
          _section('Multiple Files', colors),
          ShUiFileUpload(
            files: _files,
            multiple: true,
            onPickFiles: _addMultipleMockFiles,
            onRemove: (i) => setState(() => _files.removeAt(i)),
            hint: '여러 파일을 선택할 수 있습니다',
          ),

          const SizedBox(height: 24),

          // --- Custom Placeholder ---
          _section('Custom Placeholder', colors),
          ShUiFileUpload(
            files: const [],
            onPickFiles: () {},
            placeholder: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.cloud_upload_outlined,
                    size: 24, color: colors.foregroundMuted),
                const SizedBox(width: 8),
                Text(
                  '클라우드에 업로드',
                  style: TextStyle(
                    color: colors.foreground,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
            hint: '최대 10MB까지 업로드 가능',
          ),

          const SizedBox(height: 24),

          // --- Disabled ---
          _section('Disabled', colors),
          ShUiFileUpload(
            files: _disabledFiles,
            enabled: false,
            hint: '업로드 비활성화됨',
          ),

          const SizedBox(height: 24),

          // --- Without File List ---
          _section('Without File List', colors),
          ShUiFileUpload(
            files: _files,
            onPickFiles: _addMockFile,
            showFileList: false,
            hint: '파일 목록을 표시하지 않습니다',
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
