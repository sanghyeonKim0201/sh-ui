import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';
import '../widgets/sh_ui_app_shell.dart';
import 'accordion_page.dart';
import 'app_shell_page.dart';
import 'header_page.dart';
import 'button_page.dart';
import 'card_page.dart';
import 'carousel_page.dart';
import 'checkbox_page.dart';
import 'radio_page.dart';
import 'switch_page.dart';
import 'toggle_page.dart';
import 'input_page.dart';
import 'textarea_page.dart';
import 'label_page.dart';
import 'slider_page.dart';
import 'select_page.dart';
import 'tabs_page.dart';
import 'dialog_page.dart';
import 'popover_page.dart';
import 'toast_page.dart';
import 'date_picker_page.dart';
import 'color_picker_page.dart';
import 'combobox_page.dart';
import 'file_upload_page.dart';
import 'sidebar_page.dart';
import 'skeleton_page.dart';
import 'examples/dashboard_page.dart';
import 'examples/login_page.dart';
import 'examples/settings_page.dart';
import 'examples/signup_page.dart';

class HomePage extends StatelessWidget {
  final ThemeMode themeMode;
  final VoidCallback onToggleTheme;

  const HomePage({
    super.key,
    required this.themeMode,
    required this.onToggleTheme,
  });

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return ShUiAppShell(
      title: 'sh-ui',
      logo: Icon(Icons.hexagon_outlined, size: 22, color: colors.foreground),
      actions: [
        IconButton(
          icon: Icon(
            themeMode == ThemeMode.light
                ? Icons.dark_mode_outlined
                : Icons.light_mode_outlined,
            color: colors.foreground,
          ),
          onPressed: onToggleTheme,
        ),
      ],
      groups: [
        ShUiAppShellGroup(
          label: '예제',
          items: const [
            ShUiAppShellItem(
              icon: Icons.login,
              label: '로그인',
              builder: _buildLogin,
            ),
            ShUiAppShellItem(
              icon: Icons.person_add_outlined,
              label: '회원가입',
              builder: _buildSignup,
            ),
            ShUiAppShellItem(
              icon: Icons.settings_outlined,
              label: '설정',
              builder: _buildSettings,
            ),
            ShUiAppShellItem(
              icon: Icons.dashboard_outlined,
              label: '대시보드',
              builder: _buildDashboard,
            ),
          ],
        ),
        ShUiAppShellGroup(
          label: '폼',
          items: const [
            ShUiAppShellItem(icon: Icons.smart_button_outlined, label: 'Button', builder: _buildButton),
            ShUiAppShellItem(icon: Icons.text_fields, label: 'Input', builder: _buildInput),
            ShUiAppShellItem(icon: Icons.notes, label: 'Textarea', builder: _buildTextarea),
            ShUiAppShellItem(icon: Icons.check_box_outlined, label: 'Checkbox', builder: _buildCheckbox),
            ShUiAppShellItem(icon: Icons.radio_button_checked, label: 'Radio', builder: _buildRadio),
            ShUiAppShellItem(icon: Icons.toggle_on_outlined, label: 'Switch', builder: _buildSwitch),
            ShUiAppShellItem(icon: Icons.toggle_off_outlined, label: 'Toggle', builder: _buildToggle),
            ShUiAppShellItem(icon: Icons.tune, label: 'Slider', builder: _buildSlider),
            ShUiAppShellItem(icon: Icons.label_outline, label: 'Label', builder: _buildLabel),
          ],
        ),
        ShUiAppShellGroup(
          label: '선택',
          items: const [
            ShUiAppShellItem(icon: Icons.arrow_drop_down_circle_outlined, label: 'Select', builder: _buildSelect),
            ShUiAppShellItem(icon: Icons.search, label: 'Combobox', builder: _buildCombobox),
            ShUiAppShellItem(icon: Icons.calendar_today_outlined, label: 'Date Picker', builder: _buildDatePicker),
            ShUiAppShellItem(icon: Icons.palette_outlined, label: 'Color Picker', builder: _buildColorPicker),
          ],
        ),
        ShUiAppShellGroup(
          label: '레이아웃',
          items: const [
            ShUiAppShellItem(icon: Icons.unfold_more, label: 'Accordion', builder: _buildAccordion),
            ShUiAppShellItem(icon: Icons.web_outlined, label: 'AppShell', builder: _buildAppShell),
            ShUiAppShellItem(icon: Icons.credit_card, label: 'Card', builder: _buildCard),
            ShUiAppShellItem(icon: Icons.view_carousel_outlined, label: 'Carousel', builder: _buildCarousel),
            ShUiAppShellItem(icon: Icons.view_headline, label: 'Header', builder: _buildHeader),
            ShUiAppShellItem(icon: Icons.menu, label: 'Sidebar', builder: _buildSidebar),
            ShUiAppShellItem(icon: Icons.tab, label: 'Tabs', builder: _buildTabs),
          ],
        ),
        ShUiAppShellGroup(
          label: '표시',
          items: const [
            ShUiAppShellItem(icon: Icons.view_stream_outlined, label: 'Skeleton', builder: _buildSkeleton),
          ],
        ),
        ShUiAppShellGroup(
          label: '오버레이',
          items: const [
            ShUiAppShellItem(icon: Icons.open_in_new, label: 'Dialog', builder: _buildDialog),
            ShUiAppShellItem(icon: Icons.chat_bubble_outline, label: 'Popover', builder: _buildPopover),
            ShUiAppShellItem(icon: Icons.notifications_outlined, label: 'Toast', builder: _buildToast),
          ],
        ),
        ShUiAppShellGroup(
          label: '파일',
          items: const [
            ShUiAppShellItem(icon: Icons.upload_file, label: 'File Upload', builder: _buildFileUpload),
          ],
        ),
      ],
    );
  }
}

// 각 페이지 빌더. ShUiAppShellItem.builder 시그니처(WidgetBuilder)에 맞게
// 최상위 함수로 선언 — const 생성자에서 참조 가능.
Widget _buildLogin(BuildContext context) => const LoginPage();
Widget _buildSignup(BuildContext context) => const SignupPage();
Widget _buildSettings(BuildContext context) => const SettingsPage();
Widget _buildDashboard(BuildContext context) => const DashboardPage();

Widget _buildButton(BuildContext context) => const ButtonPage();
Widget _buildInput(BuildContext context) => const InputPage();
Widget _buildTextarea(BuildContext context) => const TextareaPage();
Widget _buildCheckbox(BuildContext context) => const CheckboxPage();
Widget _buildRadio(BuildContext context) => const RadioPage();
Widget _buildSwitch(BuildContext context) => const SwitchPage();
Widget _buildToggle(BuildContext context) => const TogglePage();
Widget _buildSlider(BuildContext context) => const SliderPage();
Widget _buildLabel(BuildContext context) => const LabelPage();

Widget _buildSelect(BuildContext context) => const SelectPage();
Widget _buildCombobox(BuildContext context) => const ComboboxPage();
Widget _buildDatePicker(BuildContext context) => const DatePickerPage();
Widget _buildColorPicker(BuildContext context) => const ColorPickerPage();

Widget _buildAccordion(BuildContext context) => const AccordionPage();
Widget _buildAppShell(BuildContext context) => const AppShellPage();
Widget _buildCard(BuildContext context) => const CardPage();
Widget _buildCarousel(BuildContext context) => const CarouselPage();
Widget _buildHeader(BuildContext context) => const HeaderPage();
Widget _buildSidebar(BuildContext context) => const SidebarPage();
Widget _buildTabs(BuildContext context) => const TabsPage();

Widget _buildSkeleton(BuildContext context) => const SkeletonPage();

Widget _buildDialog(BuildContext context) => const DialogPage();
Widget _buildPopover(BuildContext context) => const PopoverPage();
Widget _buildToast(BuildContext context) => const ToastPage();

Widget _buildFileUpload(BuildContext context) => const FileUploadPage();
