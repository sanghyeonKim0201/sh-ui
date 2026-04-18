export const dynamic = "force-static";

import { ColorPicker } from "@/components/ui/color-picker";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { ControlledColorPickerDemo } from "./_demos/controlled";

export default function ColorPickerPage() {
  return (
    <main className="container">
      <h1>ColorPicker</h1>
      <p className="muted">
        SV(채도/명도) 사각형 + Hue 슬라이더 + Hex 인풋으로 구성된 인라인 컬러 픽커. HSV 내부 상태로 드래그 정밀도를 유지한다.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 280 }}>
            <ColorPicker defaultValue="#3B82F6" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<ColorPicker defaultValue="#3B82F6" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiColorPicker(
  defaultValue: const Color(0xFF3B82F6),
)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui add color-picker`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui add color-picker

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_color_picker.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/color-picker/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { ColorPicker } from "@/components/ui/color-picker";

const [color, setColor] = useState("#3B82F6");

<ColorPicker value={color} onChange={setColor} />`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_color_picker.dart';

// 부모 StatefulWidget에서
Color _color = const Color(0xFF3B82F6);

ShUiColorPicker(
  value: _color,
  onChanged: (c) => setState(() => _color = c),
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>제어 모드 (Controlled)</h3>
      <Preview>
        <Preview.Demo>
          <ControlledColorPickerDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [color, setColor] = useState("#3B82F6");

<ColorPicker value={color} onChange={setColor} />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `Color _color = const Color(0xFF3B82F6);

ShUiColorPicker(
  value: _color,
  onChanged: (c) => setState(() => _color = c),
)`,
            },
          ]}
        />
      </Preview>

      <h3>비제어 모드 (Uncontrolled)</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 280 }}>
            <ColorPicker defaultValue="#10B981" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<ColorPicker defaultValue="#10B981" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiColorPicker(
  defaultValue: const Color(0xFF10B981),
)`,
            },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>ColorPicker</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "string", description: "현재 색상 (hex). 제어 모드에서 사용." },
          { prop: "defaultValue", type: "string", default: `"#000000"`, description: "비제어 모드 초기값." },
          { prop: "onChange", type: "(hex: string) => void", description: "색상 변경 콜백. 항상 6자리 대문자 hex." },
          { prop: "className", type: "string" },
        ]}
      />

      <h3>내부 구성</h3>
      <p className="muted">단일 컴포넌트지만 시각적으로 세 영역으로 나뉨.</p>
      <ul>
        <li><strong>SV 영역</strong> — 드래그로 채도/명도 동시 조정</li>
        <li><strong>Hue 슬라이더</strong> — 색조 0~360°</li>
        <li><strong>Hex 인풋</strong> — 직접 입력 (Enter/blur로 커밋, 잘못된 값은 자동 복원)</li>
      </ul>
    </main>
  );
}
