export const dynamic = "force-static";

import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { BasicDemo, VariantsDemo, TitleDescDemo, ActionDemo } from "./_demos/basic";

export default function ToastPage() {
  return (
    <main className="container">
      <h1>Toast</h1>
      <p className="muted">
        짧은 피드백 메시지를 화면 하단에 표시한다. <code>toast()</code> 함수 호출만으로 사용 가능.
      </p>

      <Preview>
        <Preview.Demo>
          <BasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { toast } from "@/components/ui/toast";

<Button onClick={() => toast("변경사항이 저장되었습니다.")}>
  토스트 보기
</Button>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `import 'package:your_app/widgets/sh_ui_toast.dart';

ShUiButton(
  onPressed: () => ShUiToast.show(
    context,
    description: '변경사항이 저장되었습니다.',
  ),
  child: const Text('토스트 보기'),
)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui add toast` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui add toast` },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        React: registry의 <code>components/ui/toast/</code> 파일을 복사.
        Flutter: <code>packages/registry/flutter/widgets/sh_ui_toast.dart</code>를 <code>lib/widgets/</code>로 복사.
      </p>
      <ul>
        <li><code>index.tsx</code> / <code>styles.css</code> (React)</li>
        <li><code>sh_ui_toast.dart</code> (Flutter)</li>
      </ul>

      <h3>Toaster 설정</h3>
      <p className="muted">
        React는 루트 레이아웃에 <code>&lt;Toaster /&gt;</code>를 한 번 배치하고, Flutter는 앱 최상위를 <code>ShUiToaster</code>로 감싼다.
        모두 <code>position</code>으로 표시 위치를 지정한다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `// app/layout.tsx
import { Toaster } from "@/components/ui/toast";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// main.dart
MaterialApp(
  builder: (context, child) => ShUiToaster(
    position: ShUiToastPosition.bottomRight,
    child: child!,
  ),
  home: const HomePage(),
)`,
          },
        ]}
      />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { toast } from "@/components/ui/toast";

// 간단한 메시지
toast("저장되었습니다.");

// variant 헬퍼
toast.success("업로드 완료");
toast.danger("삭제 실패");
toast.warning("용량이 부족합니다");

// 제목 + 설명
toast({ title: "완료", description: "파일이 업로드되었습니다.", variant: "success" });

// 프로그래매틱 닫기
const id = toast("처리 중...");
toast.dismiss(id);`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// 간단한 메시지
ShUiToast.show(context, description: '저장되었습니다.');

// variant 헬퍼
ShUiToast.success(context, description: '업로드 완료');
ShUiToast.danger(context, description: '삭제 실패');
ShUiToast.warning(context, description: '용량이 부족합니다');

// 제목 + 설명
ShUiToast.success(
  context,
  title: '완료',
  description: '파일이 업로드되었습니다.',
);

// 프로그래매틱 닫기
final id = ShUiToast.show(context, description: '처리 중...');
ShUiToast.dismiss(context, id);`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>Variant</h3>
      <Preview>
        <Preview.Demo>
          <VariantsDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `toast("기본 알림입니다.");
toast.success("저장되었습니다.");
toast.danger("삭제에 실패했습니다.");
toast.warning("저장 용량이 부족합니다.");`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiToast.show(context, description: '기본 알림입니다.');
ShUiToast.success(context, description: '저장되었습니다.');
ShUiToast.danger(context, description: '삭제에 실패했습니다.');
ShUiToast.warning(context, description: '저장 용량이 부족합니다.');`,
            },
          ]}
        />
      </Preview>

      <h3>제목 + 설명</h3>
      <Preview>
        <Preview.Demo>
          <TitleDescDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `toast({
  title: "파일 업로드 완료",
  description: "report-2024.pdf가 성공적으로 업로드되었습니다.",
  variant: "success",
});`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiToast.success(
  context,
  title: '파일 업로드 완료',
  description: 'report-2024.pdf가 성공적으로 업로드되었습니다.',
);`,
            },
          ]}
        />
      </Preview>

      <h3>위치 선택</h3>
      <p className="muted">
        <code>&lt;Toaster&gt;</code>의 <code>position</code> prop으로 표시 위치를 지정한다.
        레이아웃에 한 번 설정하면 모든 토스트에 일괄 적용된다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `// 레이아웃에서 위치 설정
<Toaster position="top-center" />

// 지원 위치:
// "top-left" | "top-right" | "top-center"
// "bottom-left" | "bottom-right" | "bottom-center"
// 기본값: "bottom-right"`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// 앱 최상위에서 위치 설정
ShUiToaster(
  position: ShUiToastPosition.topCenter,
  child: child!,
)

// 지원 위치 (ShUiToastPosition):
// topLeft | topRight | topCenter
// bottomLeft | bottomRight | bottomCenter
// 기본값: bottomRight`,
          },
        ]}
      />

      <h3>액션 버튼</h3>
      <Preview>
        <Preview.Demo>
          <ActionDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const id = toast({
  title: "메시지 삭제됨",
  description: "휴지통으로 이동했습니다.",
  duration: 6000,
  action: (
    <Button size="sm" variant="secondary" onClick={() => toast.dismiss(id)}>
      되돌리기
    </Button>
  ),
});`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `late final String id;
id = ShUiToast.show(
  context,
  title: '메시지 삭제됨',
  description: '휴지통으로 이동했습니다.',
  duration: const Duration(seconds: 6),
  action: ShUiButton(
    size: ShUiButtonSize.sm,
    variant: ShUiButtonVariant.secondary,
    onPressed: () => ShUiToast.dismiss(context, id),
    child: const Text('되돌리기'),
  ),
);`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "toast()", description: "토스트를 표시하는 함수. 문자열 또는 ToastInput 객체를 받는다." },
          { name: "toast.success()", description: "success variant 헬퍼." },
          { name: "toast.danger()", description: "danger variant 헬퍼." },
          { name: "toast.warning()", description: "warning variant 헬퍼." },
          { name: "toast.dismiss(id)", description: "특정 토스트를 프로그래매틱으로 닫는다." },
          { name: "Toaster", description: "토스트를 렌더링하는 뷰포트 컴포넌트. 루트 레이아웃에 한 번 배치." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>toast(input)</h3>
      <PropsTable
        rows={[
          { prop: "title", type: "ReactNode", description: "굵은 제목 텍스트." },
          { prop: "description", type: "ReactNode", description: "본문 텍스트." },
          { prop: "variant", type: `"default" | "success" | "danger" | "warning"`, default: `"default"`, description: "색상 및 아이콘 변형." },
          { prop: "duration", type: "number", default: "4000", description: "자동 닫힘 시간(ms). 0이면 수동 닫기만." },
          { prop: "action", type: "ReactNode", description: "우측에 표시할 액션 요소 (버튼 등)." },
        ]}
      />

      <h3>Toaster</h3>
      <PropsTable
        rows={[
          { prop: "position", type: `"top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center"`, default: `"bottom-right"`, description: "토스트 표시 위치. 레이아웃에 한 번 설정하면 모든 토스트에 일괄 적용." },
          { prop: "container", type: "Element | null", description: "Portal 마운트 대상. 기본 document.body." },
        ]}
      />
    </main>
  );
}
