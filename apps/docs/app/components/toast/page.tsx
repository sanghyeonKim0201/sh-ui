export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
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
        <CodePanel
          language="tsx"
          code={`import { toast } from "@/components/ui/toast";

<Button onClick={() => toast("변경사항이 저장되었습니다.")}>
  토스트 보기
</Button>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add toast`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/toast/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h3>Toaster 설정</h3>
      <p className="muted">
        루트 레이아웃에 <code>&lt;Toaster /&gt;</code>를 한 번 배치한다.
        <code>position</code> prop으로 표시 위치를 지정할 수 있다.
      </p>
      <CodePanel
        language="tsx"
        code={`// app/layout.tsx
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
}`}
      />

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { toast } from "@/components/ui/toast";

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
toast.dismiss(id);`}
      />

      <h2>Examples</h2>

      <h3>Variant</h3>
      <Preview>
        <Preview.Demo>
          <VariantsDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`toast("기본 알림입니다.");
toast.success("저장되었습니다.");
toast.danger("삭제에 실패했습니다.");
toast.warning("저장 용량이 부족합니다.");`}
        />
      </Preview>

      <h3>제목 + 설명</h3>
      <Preview>
        <Preview.Demo>
          <TitleDescDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`toast({
  title: "파일 업로드 완료",
  description: "report-2024.pdf가 성공적으로 업로드되었습니다.",
  variant: "success",
});`}
        />
      </Preview>

      <h3>위치 선택</h3>
      <p className="muted">
        <code>&lt;Toaster&gt;</code>의 <code>position</code> prop으로 표시 위치를 지정한다.
        레이아웃에 한 번 설정하면 모든 토스트에 일괄 적용된다.
      </p>
      <CodePanel
        language="tsx"
        code={`// 레이아웃에서 위치 설정
<Toaster position="top-center" />

// 지원 위치:
// "top-left" | "top-right" | "top-center"
// "bottom-left" | "bottom-right" | "bottom-center"
// 기본값: "bottom-right"`}
      />

      <h3>액션 버튼</h3>
      <Preview>
        <Preview.Demo>
          <ActionDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`const id = toast({
  title: "메시지 삭제됨",
  description: "휴지통으로 이동했습니다.",
  duration: 6000,
  action: (
    <Button size="sm" variant="secondary" onClick={() => toast.dismiss(id)}>
      되돌리기
    </Button>
  ),
});`}
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
