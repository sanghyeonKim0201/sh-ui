export const dynamic = "force-static";

import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { BasicDialogDemo, FormDialogDemo } from "./_demos/basic";

export default function DialogPage() {
  return (
    <main className="container">
      <h1>Dialog</h1>
      <p className="muted">
        모달 대화상자.{" "}
        <a href="https://base-ui.com/react/components/dialog" target="_blank" rel="noreferrer">
          Base UI Dialog
        </a>{" "}
        위에 sh-ui 토큰 스타일을 입혔다. 포커스 트랩, Esc 닫기, 배경 블러 + 클릭 닫기 기본 지원.
      </p>

      <Preview>
        <Preview.Demo>
          <BasicDialogDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Dialog>
  <DialogTrigger render={<Button />}>프로젝트 삭제</DialogTrigger>
  <DialogContent>
    <DialogCloseX />
    <DialogTitle>프로젝트를 삭제하시겠습니까?</DialogTitle>
    <DialogDescription>
      이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구 삭제됩니다.
    </DialogDescription>
    <DialogFooter>
      <DialogClose render={<Button variant="secondary" />}>취소</DialogClose>
      <DialogClose render={<Button variant="danger" />}>삭제</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// 명령형 — ShUiDialog.show(...)
ShUiButton(
  onPressed: () => ShUiDialog.show(
    context: context,
    builder: (context) => ShUiDialogContent(
      title: const ShUiDialogTitle('프로젝트를 삭제하시겠습니까?'),
      description: const ShUiDialogDescription(
        '이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구 삭제됩니다.',
      ),
      footer: ShUiDialogFooter(children: [
        ShUiButton(
          variant: ShUiButtonVariant.secondary,
          onPressed: () => Navigator.pop(context),
          child: const Text('취소'),
        ),
        ShUiButton(
          variant: ShUiButtonVariant.danger,
          onPressed: () => Navigator.pop(context),
          child: const Text('삭제'),
        ),
      ]),
    ),
  ),
  child: const Text('프로젝트 삭제'),
)`,
            },
            {
              value: "flutter-declarative",
              label: "Flutter (declarative)",
              language: "dart",
              code: `// 선언형 — open / onOpenChange로 외부 상태 동기화
bool _open = false;

// build 내부:
Column(children: [
  ShUiButton(
    onPressed: () => setState(() => _open = true),
    child: const Text('프로젝트 삭제'),
  ),
  ShUiDialog(
    open: _open,
    onOpenChange: (v) => setState(() => _open = v),
    child: ShUiDialogContent(
      header: const ShUiDialogHeader(
        title: '프로젝트를 삭제하시겠습니까?',
        description: '이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구 삭제됩니다.',
      ),
      footer: ShUiDialogFooter(children: [
        ShUiButton(
          variant: ShUiButtonVariant.secondary,
          onPressed: () => setState(() => _open = false),
          child: const Text('취소'),
        ),
        ShUiButton(
          variant: ShUiButtonVariant.danger,
          onPressed: () => setState(() => _open = false),
          child: const Text('삭제'),
        ),
      ]),
    ),
  ),
])`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui add dialog` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui add dialog` },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        React는 registry에서 <code>components/ui/dialog/</code>로 복사하고 Base UI를 설치한다. Flutter는 <code>packages/registry/flutter/widgets/sh_ui_dialog.dart</code>를 <code>lib/widgets/</code>로 복사한다.
      </p>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `pnpm add @base-ui-components/react` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `# 추가 의존성 없음 — Material 기반` },
        ]}
      />

      <h2>Examples</h2>

      <h3>폼이 포함된 Dialog</h3>
      <Preview>
        <Preview.Demo>
          <FormDialogDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Dialog>
  <DialogTrigger render={<Button variant="secondary" />}>피드백 보내기</DialogTrigger>
  <DialogContent>
    <DialogCloseX />
    <DialogTitle>피드백</DialogTitle>
    <DialogDescription>개선 사항이나 버그를 알려주세요.</DialogDescription>
    <textarea placeholder="의견을 입력하세요..." />
    <DialogFooter>
      <DialogClose render={<Button variant="secondary" />}>취소</DialogClose>
      <Button>보내기</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiButton(
  variant: ShUiButtonVariant.secondary,
  onPressed: () => ShUiDialog.show(
    context: context,
    builder: (context) => ShUiDialogContent(
      title: const ShUiDialogTitle('피드백'),
      description: const ShUiDialogDescription('개선 사항이나 버그를 알려주세요.'),
      child: const ShUiTextarea(placeholder: '의견을 입력하세요...'),
      footer: ShUiDialogFooter(children: [
        ShUiButton(
          variant: ShUiButtonVariant.secondary,
          onPressed: () => Navigator.pop(context),
          child: const Text('취소'),
        ),
        ShUiButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('보내기'),
        ),
      ]),
    ),
  ),
  child: const Text('피드백 보내기'),
)`,
            },
          ]}
        />
      </Preview>

      <h3>제어 모드</h3>
      <p className="muted">
        <code>open</code> + <code>onOpenChange</code>로 외부 상태와 동기화. 폼 제출 후 닫기 등에 사용.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger render={<Button />}>열기</DialogTrigger>
  <DialogContent>
    <DialogTitle>Controlled Dialog</DialogTitle>
    <DialogDescription>외부에서 상태를 제어합니다.</DialogDescription>
    <DialogFooter>
      <Button variant="secondary" onClick={() => setOpen(false)}>닫기</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// 선언형 ShUiDialog — open / onOpenChange로 외부 상태 동기화.
bool _open = false;

ShUiDialog(
  open: _open,
  onOpenChange: (v) => setState(() => _open = v),
  child: ShUiDialogContent(
    header: const ShUiDialogHeader(
      title: 'Controlled Dialog',
      description: '외부에서 상태를 제어합니다.',
    ),
    footer: ShUiDialogFooter(children: [
      ShUiButton(
        variant: ShUiButtonVariant.secondary,
        onPressed: () => setState(() => _open = false),
        child: const Text('닫기'),
      ),
    ]),
  ),
)`,
          },
        ]}
      />

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Dialog", description: "루트. open/defaultOpen/onOpenChange." },
          { name: "DialogTrigger", description: "클릭 시 Dialog를 여는 트리거. render prop으로 Button 등과 결합." },
          { name: "DialogContent", description: "모달 콘텐츠 (Portal + Backdrop + Popup). 포커스 트랩 내장." },
          { name: "DialogTitle", description: "대화상자 제목. 접근성을 위해 반드시 포함 권장." },
          { name: "DialogDescription", description: "대화상자 설명." },
          { name: "DialogFooter", description: "액션 버튼 영역. 상단 border-top으로 구분." },
          { name: "DialogClose", description: "클릭 시 Dialog를 닫는 버튼. render prop으로 Button 등과 결합." },
          { name: "DialogCloseX", description: "우상단 × 닫기 버튼. 스타일·aria-label 내장. <DialogCloseX />만으로 사용." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>Dialog</h3>
      <PropsTable
        rows={[
          { prop: "defaultOpen", type: "boolean", description: "초기 열림 상태 (uncontrolled)." },
          { prop: "open", type: "boolean", description: "열림 상태 (controlled)." },
          { prop: "onOpenChange", type: "(open: boolean) => void", description: "열림 상태 변경 콜백." },
        ]}
      />

      <h3>DialogTrigger</h3>
      <PropsTable
        rows={[
          { prop: "render", type: "ReactElement", description: "트리거로 렌더할 요소. 예: render={<Button />}." },
        ]}
      />

      <h3>DialogContent</h3>
      <PropsTable
        rows={[
          { prop: "container", type: "Element | RefObject", description: "Portal 마운트 노드. 기본 body." },
        ]}
      />

      <h3>DialogClose</h3>
      <PropsTable
        rows={[
          { prop: "render", type: "ReactElement", description: "닫기 버튼으로 렌더할 요소. 예: render={<Button variant=\"secondary\" />}." },
        ]}
      />

      <h2>스타일 커스터마이즈</h2>
      <p className="muted">
        모든 파트가 네이티브 HTML 속성(<code>style</code>·<code>className</code>·
        <code>data-*</code>)을 그대로 받는다. Dialog 폭·패딩·간격 조정은
        <code>style</code> 또는 <code>className</code> 으로 직접 — 자세한 패턴은{" "}
        <a href="/guidelines">가이드라인</a> 의 "스타일 커스터마이즈" 섹션 참조.
      </p>
    </main>
  );
}
