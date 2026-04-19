export const dynamic = "force-static";

import {
  ColorPicker,
  ColorPickerSaturation,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerHex,
  ColorPickerSwatches,
} from "@/components/ui/color-picker";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { ControlledColorPickerDemo } from "./_demos/controlled";

const PRESET_SWATCHES = [
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#111827",
];

export default function ColorPickerPage() {
  return (
    <main className="container">
      <h1>ColorPicker</h1>
      <p className="muted">
        SV(채도/명도) + Hue + Alpha + Hex 인풋 + Swatches로 구성된 인라인 컬러 픽커. Compound 패턴으로 필요한 파트만 조합해서 쓴다.
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
              code: `// children이 없으면 기본 레이아웃(Saturation + Hue + Hex) 자동 렌더 (backward-compat)
<ColorPicker defaultValue="#3B82F6" />`,
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
            code: `import {
  ColorPicker,
  ColorPickerSaturation,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerHex,
  ColorPickerSwatches,
} from "@/components/ui/color-picker";

const [color, setColor] = useState("#3B82F6");

<ColorPicker value={color} onChange={setColor}>
  <ColorPickerSaturation />
  <ColorPickerHue />
  <ColorPickerAlpha />
  <ColorPickerHex />
  <ColorPickerSwatches colors={["#EF4444", "#3B82F6", "#10B981"]} />
</ColorPicker>`,
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

      <h3>Compound 전체 파트</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 280 }}>
            <ColorPicker defaultValue="#6366F1">
              <ColorPickerSaturation />
              <ColorPickerHue />
              <ColorPickerAlpha />
              <ColorPickerHex />
              <ColorPickerSwatches colors={PRESET_SWATCHES} />
            </ColorPicker>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<ColorPicker defaultValue="#6366F1">
  <ColorPickerSaturation />
  <ColorPickerHue />
  <ColorPickerAlpha />
  <ColorPickerHex />
  <ColorPickerSwatches colors={[
    "#EF4444","#F59E0B","#10B981","#3B82F6",
    "#6366F1","#8B5CF6","#EC4899","#111827",
  ]} />
</ColorPicker>`,
            },
          ]}
        />
      </Preview>

      <h3>Swatch 전용 (파트만 선택)</h3>
      <p className="muted">
        필요한 파트만 골라서 조합. 아래는 SV 제거, Hue + Hex + Swatches만 남긴 변형.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 280 }}>
            <ColorPicker defaultValue="#10B981">
              <ColorPickerHue />
              <ColorPickerHex />
              <ColorPickerSwatches colors={PRESET_SWATCHES} />
            </ColorPicker>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<ColorPicker defaultValue="#10B981">
  <ColorPickerHue />
  <ColorPickerHex />
  <ColorPickerSwatches colors={PRESET_SWATCHES} />
</ColorPicker>`,
            },
          ]}
        />
      </Preview>

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
          { prop: "children", type: "ReactNode", description: "compound 구성. 없으면 기본 레이아웃(Saturation + Hue + Hex) 자동 렌더." },
          { prop: "className", type: "string" },
        ]}
      />

      <h3>Compound Parts</h3>
      <ul>
        <li><strong>ColorPickerSaturation</strong> — 2D 채도/명도 사각형. 드래그로 동시 조정.</li>
        <li><strong>ColorPickerHue</strong> — 색조 슬라이더 (0~360°).</li>
        <li><strong>ColorPickerAlpha</strong> — 투명도 슬라이더. 선택 사항.</li>
        <li><strong>ColorPickerHex</strong> — Hex 인풋 + 미리보기 swatch. <code>showSwatch</code> prop으로 좌측 swatch 제어.</li>
        <li><strong>ColorPickerSwatches</strong> — 프리셋 색상 버튼 그리드. <code>colors: string[]</code> prop 필수.</li>
      </ul>

      <h3>동작 메모</h3>
      <ul>
        <li>Hex 인풋은 blur/Enter로 커밋되며 잘못된 값은 자동 복원된다.</li>
        <li>드래그 중 HSV를 내부 상태로 유지하므로 회색/흑색에서 hue가 리셋되지 않는다.</li>
        <li><code>ColorPickerAlpha</code>는 현재 시각화/상호작용만 제공 — <code>onChange</code>는 6자리 hex(알파 제외). 알파 연동이 필요하면 compound 확장으로 hsva state를 노출하는 커스텀 파트를 추가하라.</li>
      </ul>
    </main>
  );
}
