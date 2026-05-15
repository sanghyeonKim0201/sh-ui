export const dynamic = "force-static";

import fs from "node:fs";
import path from "node:path";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { VariantSource } from "@/components/variant-source";
import { ButtonLiveDemo } from "./button-live-demo";

const variants = ["primary", "secondary", "ghost", "danger", "link"] as const;
const sizes = ["sm", "md", "lg"] as const;

// Sandpack hidden files — 빌드 타임에 실제 sh-ui 소스 / 토큰을 string 으로 읽어
// 클라이언트 컴포넌트로 prop 전달. 단일 소스 (apps/docs) 와 자동 동기화.
const docsRoot = process.cwd();
const buttonSource = fs.readFileSync(
  path.join(docsRoot, "components/ui/button/index.tsx"),
  "utf-8",
);
const buttonStyles = fs.readFileSync(
  path.join(docsRoot, "components/ui/button/styles.css"),
  "utf-8",
);
const tokensCss = fs.readFileSync(
  path.join(docsRoot, "app/styles/tokens.css"),
  "utf-8",
);

export default function ButtonPage() {
  return (
    <main className="container">
      <h1>Button</h1>
      <p className="muted">기본 상호작용 요소. 5가지 variant × 3가지 size.</p>

      <ButtonLiveDemo
        buttonSource={buttonSource}
        buttonStyles={buttonStyles}
        tokensCss={tokensCss}
      />

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add button`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add button

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_button.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="button" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Button } from "@/components/ui/button";

<Button variant="primary" size="md" onClick={handleClick}>
  저장
</Button>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_button.dart';

ShUiButton(
  variant: ShUiButtonVariant.primary,
  size: ShUiButtonSize.md,
  onPressed: handlePressed,
  child: const Text('저장'),
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>Variants</h3>
      <Preview>
        <Preview.Demo>
          {variants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Button variant="primary">primary</Button>
<Button variant="secondary">secondary</Button>
<Button variant="ghost">ghost</Button>
<Button variant="danger">danger</Button>
<Button variant="link">link</Button>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiButton(
  variant: ShUiButtonVariant.primary,
  onPressed: () {},
  child: const Text('primary'),
)
ShUiButton(
  variant: ShUiButtonVariant.secondary,
  onPressed: () {},
  child: const Text('secondary'),
)
ShUiButton(
  variant: ShUiButtonVariant.ghost,
  onPressed: () {},
  child: const Text('ghost'),
)
ShUiButton(
  variant: ShUiButtonVariant.danger,
  onPressed: () {},
  child: const Text('danger'),
)
ShUiButton(
  variant: ShUiButtonVariant.link,
  onPressed: () {},
  child: const Text('link'),
)`,
            },
          ]}
        />
      </Preview>

      <h3>Sizes</h3>
      <Preview>
        <Preview.Demo>
          {sizes.map((s) => (
            <Button key={s} size={s}>
              size = {s}
            </Button>
          ))}
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Button size="sm">size = sm</Button>
<Button size="md">size = md</Button>
<Button size="lg">size = lg</Button>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiButton(
  size: ShUiButtonSize.sm,
  onPressed: () {},
  child: const Text('size = sm'),
)
ShUiButton(
  size: ShUiButtonSize.md,
  onPressed: () {},
  child: const Text('size = md'),
)
ShUiButton(
  size: ShUiButtonSize.lg,
  onPressed: () {},
  child: const Text('size = lg'),
)`,
            },
          ]}
        />
      </Preview>

      <h3>Disabled</h3>
      <Preview>
        <Preview.Demo>
          <Button disabled>primary</Button>
          <Button variant="secondary" disabled>secondary</Button>
          <Button variant="ghost" disabled>ghost</Button>
          <Button variant="danger" disabled>danger</Button>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Button disabled>primary</Button>
<Button variant="secondary" disabled>secondary</Button>
<Button variant="ghost" disabled>ghost</Button>
<Button variant="danger" disabled>danger</Button>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter에서는 onPressed: null 로 비활성 처리
const ShUiButton(
  variant: ShUiButtonVariant.primary,
  child: Text('primary'),
)
const ShUiButton(
  variant: ShUiButtonVariant.secondary,
  child: Text('secondary'),
)
const ShUiButton(
  variant: ShUiButtonVariant.ghost,
  child: Text('ghost'),
)
const ShUiButton(
  variant: ShUiButtonVariant.danger,
  child: Text('danger'),
)`,
            },
          ]}
        />
      </Preview>

      <h3>로딩 상태</h3>
      <p className="muted">
        Button 자체에는 <code>loading</code> prop 이 없다. 비동기 액션 중에는 <code>disabled</code>{" "}
        + <code>aria-busy</code> 로 더블 서밋을 막고, 안에 <code>Spinner</code> 를 끼워 시각적으로 알린다.
        문구가 바뀌면 너비가 점프하므로 <code>min-width</code> 로 자리잡거나 텍스트를 그대로 두는 걸 권장.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function SaveButton() {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await save();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={pending}
      aria-busy={pending || undefined}
      style={{ minWidth: "6rem" }}
    >
      {pending ? (
        <>
          <Spinner size="sm" aria-label="저장 중" />
          저장 중…
        </>
      ) : (
        "저장"
      )}
    </Button>
  );
}`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_button.dart';
import '../widgets/sh_ui_spinner.dart';

class SaveButton extends StatefulWidget {
  const SaveButton({super.key});
  @override
  State<SaveButton> createState() => _SaveButtonState();
}

class _SaveButtonState extends State<SaveButton> {
  bool _pending = false;

  Future<void> _handlePressed() async {
    setState(() => _pending = true);
    try {
      await save();
    } finally {
      if (mounted) setState(() => _pending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 96),
      child: ShUiButton(
        // onPressed: null 이면 비활성 + 시각 스타일 자동 적용
        onPressed: _pending ? null : _handlePressed,
        child: _pending
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  ShUiSpinner(size: ShUiSpinnerSize.sm),
                  SizedBox(width: 8),
                  Text('저장 중…'),
                ],
              )
            : const Text('저장'),
      ),
    );
  }
}`,
          },
        ]}
      />

      <h3>전체 매트릭스</h3>
      <Preview>
        <Preview.Demo>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto repeat(3, auto)",
              gap: "0.75rem 1.25rem",
              alignItems: "center",
              justifyItems: "start",
            }}
          >
            <div />
            {sizes.map((s) => (
              <div key={s} className="muted" style={{ fontSize: "0.75rem", textAlign: "center" }}>
                {s}
              </div>
            ))}
            {variants.map((v) => (
              <Fragment key={v}>
                <div className="muted" style={{ fontSize: "0.75rem" }}>{v}</div>
                {sizes.map((s) => (
                  <Button key={`${v}-${s}`} variant={v} size={s}>
                    {v}
                  </Button>
                ))}
              </Fragment>
            ))}
          </div>
        </Preview.Demo>
      </Preview>

      <h2>API Reference</h2>

      <h3>Button</h3>
      <p className="muted">
        네이티브 <code>&lt;button&gt;</code>을 감싸 토큰 기반 스타일과 variant/size를 제공한다.
        나열되지 않은 모든 네이티브 <code>button</code> 속성을 그대로 받는다.
      </p>
      <PropsTable
        rows={[
          {
            prop: "variant",
            type: `"primary" | "secondary" | "ghost" | "danger" | "link"`,
            default: `"primary"`,
            description: "시각적 스타일 종류.",
          },
          {
            prop: "size",
            type: `"sm" | "md" | "lg"`,
            default: `"md"`,
            description: "버튼 크기. 패딩과 폰트 사이즈가 함께 변한다.",
          },
          {
            prop: "disabled",
            type: "boolean",
            description: "비활성 상태. 포인터 이벤트와 키보드 인터랙션이 차단된다.",
          },
        ]}
      />

      <h2>접근성</h2>
      <ul>
        <li><code>Tab</code> / <code>Shift+Tab</code> — 포커스 이동 (disabled 시 포커스 제외)</li>
        <li><code>Enter</code> / <code>Space</code> — 활성화</li>
        <li>네이티브 <code>&lt;button&gt;</code> 요소라 스크린리더에 role/상태 자동 전달</li>
      </ul>
    </main>
  );
}
