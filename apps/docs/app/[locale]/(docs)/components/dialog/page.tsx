export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { BasicDialogDemo, FormDialogDemo } from "./_demos/basic";
import { VariantSource } from "@/components/variant-source";

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
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add dialog` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add dialog` },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="dialog" />
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `pnpm add @base-ui/react` },
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

      <h3>비동기 confirm 액션</h3>
      <p className="muted">
        삭제·결제처럼 confirm 액션이 비동기일 때의 패턴. 핵심은 두 가지 — (1) confirm 버튼은{" "}
        <code>disabled</code> + <code>Spinner</code> 로 더블 클릭 차단,
        (2) Dialog 는 <code>open</code> 을 직접 제어해서 작업 끝날 때까지 닫히지 않도록.
        제어 모드에서는 backdrop 클릭·<code>Esc</code> 로도 닫히지 않게 막는 게 안전하다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function DeleteDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await deleteItem(id);
      setOpen(false);     // 성공 시에만 닫음
    } catch (e) {
      // 에러 토스트 등 — Dialog 는 열린 채로 사용자에게 재시도 기회
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // pending 중에는 외부 클릭/Esc 로 닫히는 것 차단
        if (pending) return;
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button variant="danger" />}>삭제</DialogTrigger>
      <DialogContent>
        <DialogTitle>정말 삭제할까요?</DialogTitle>
        <DialogDescription>이 작업은 되돌릴 수 없습니다.</DialogDescription>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            취소
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={pending}
            aria-busy={pending || undefined}
            style={{ minWidth: "6rem" }}
          >
            {pending ? (
              <>
                <Spinner size="sm" aria-label="삭제 중" />
                삭제 중…
              </>
            ) : (
              "삭제"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `class DeleteDialog extends StatefulWidget {
  final String id;
  const DeleteDialog({super.key, required this.id});
  @override
  State<DeleteDialog> createState() => _DeleteDialogState();
}

class _DeleteDialogState extends State<DeleteDialog> {
  bool _open = false;
  bool _pending = false;

  Future<void> _confirm() async {
    setState(() => _pending = true);
    try {
      await deleteItem(widget.id);
      if (mounted) setState(() => _open = false);  // 성공 시에만 닫음
    } finally {
      if (mounted) setState(() => _pending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ShUiDialog(
      open: _open,
      onOpenChange: (v) {
        if (_pending) return;  // 작업 중엔 외부 닫기 차단
        setState(() => _open = v);
      },
      // dismissible: false 등 백드롭 차단 prop 이 있다면 같이 사용
      child: ShUiDialogContent(
        header: const ShUiDialogHeader(
          title: '정말 삭제할까요?',
          description: '이 작업은 되돌릴 수 없습니다.',
        ),
        footer: ShUiDialogFooter(children: [
          ShUiButton(
            variant: ShUiButtonVariant.secondary,
            onPressed: _pending ? null : () => setState(() => _open = false),
            child: const Text('취소'),
          ),
          ConstrainedBox(
            constraints: const BoxConstraints(minWidth: 96),
            child: ShUiButton(
              variant: ShUiButtonVariant.danger,
              onPressed: _pending ? null : _confirm,
              child: _pending
                  ? Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        ShUiSpinner(size: ShUiSpinnerSize.sm),
                        SizedBox(width: 8),
                        Text('삭제 중…'),
                      ],
                    )
                  : const Text('삭제'),
            ),
          ),
        ]),
      ),
    );
  }
}`,
          },
        ]}
      />
      <p className="muted" style={{ marginTop: "var(--space-3)" }}>
        주의 — <code>onOpenChange</code> 에서 <code>pending</code> 일 때 early return 하면
        Esc·backdrop 클릭이 모두 무시된다. 하지만 화면 전체 키보드 트랩이 되지 않게
        에러 발생 시에는 반드시 <code>pending</code> 을 풀어줘야 한다 (위 <code>finally</code> 참고).
      </p>

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
