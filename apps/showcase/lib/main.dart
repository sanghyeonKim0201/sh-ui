import 'package:flutter/material.dart';
import 'foundation/sh_ui_tokens.dart';
import 'pages/home_page.dart';

void main() {
  runApp(const ShUiShowcaseApp());
}

class ShUiShowcaseApp extends StatefulWidget {
  const ShUiShowcaseApp({super.key});

  @override
  State<ShUiShowcaseApp> createState() => _ShUiShowcaseAppState();
}

class _ShUiShowcaseAppState extends State<ShUiShowcaseApp> {
  ThemeMode _themeMode = ThemeMode.light;

  void _toggleTheme() {
    setState(() {
      _themeMode =
          _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'sh-ui Showcase',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: ShUiColorTokens.light.background,
        extensions: const [ShUiTheme.light],
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: ShUiColorTokens.dark.background,
        extensions: const [ShUiTheme.dark],
      ),
      home: HomePage(
        themeMode: _themeMode,
        onToggleTheme: _toggleTheme,
      ),
    );
  }
}
