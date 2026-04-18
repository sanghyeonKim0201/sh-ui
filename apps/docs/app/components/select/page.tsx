export const dynamic = "force-static";

import {
  MultiSelect,
  MultiSelectValue,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { ChipMultiSelectDemo } from "./_demos/chip-multi";

export default function SelectPage() {
  return (
    <main className="container">
      <h1>Select</h1>
      <p className="muted">
        단일 선택 드롭다운. <a href="https://base-ui.com/react/components/select" target="_blank" rel="noreferrer">Base UI</a>의 headless primitive 위에 sh-ui 토큰 스타일을 입혔다.
      </p>

      <Preview>
        <Preview.Demo>
          <Select>
            <SelectTrigger style={{ width: "12rem" }}>
              <SelectValue placeholder="과일 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Select>
  <SelectTrigger>
    <SelectValue placeholder="과일 선택" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruits</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="grapes">Grapes</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `String? _selected;

ShUiSelect<String>(
  value: _selected,
  onChanged: (v) => setState(() => _selected = v),
  placeholder: '과일 선택',
  items: const [
    ShUiSelectItem(value: 'apple', child: Text('Apple')),
    ShUiSelectItem(value: 'banana', child: Text('Banana')),
    ShUiSelectItem(value: 'grapes', child: Text('Grapes')),
  ],
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
            code: `npx sh-ui add select`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui add select

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_select.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/select/</code>로 복사하고, Base UI를 설치한다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `pnpm add @base-ui-components/react`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `# 추가 의존성 없음
# packages/registry/flutter/widgets/sh_ui_select.dart → lib/widgets/`,
          },
        ]}
      />
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
            code: `// 단일 선택
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="선택하세요" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
  </SelectContent>
</Select>

// 다중 선택 (value: string[])
<MultiSelect value={values} onValueChange={setValues}>
  <SelectTrigger>
    <MultiSelectValue placeholder="여러 개 선택" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
  </SelectContent>
</MultiSelect>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// 단일 선택 (Flutter는 기본적으로 단일 선택만 제공)
String? value;

ShUiSelect<String>(
  value: value,
  onChanged: (v) => setState(() => value = v),
  placeholder: '선택하세요',
  items: const [
    ShUiSelectItem(value: 'apple', child: Text('Apple')),
  ],
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>그룹 + 구분선</h3>
      <Preview>
        <Preview.Demo>
          <Select>
            <SelectTrigger style={{ width: "14rem" }}>
              <SelectValue placeholder="국가 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>아시아</SelectLabel>
                <SelectItem value="kr">대한민국</SelectItem>
                <SelectItem value="jp">일본</SelectItem>
                <SelectItem value="tw">대만</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>유럽</SelectLabel>
                <SelectItem value="de">독일</SelectItem>
                <SelectItem value="fr">프랑스</SelectItem>
                <SelectItem value="uk">영국</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Select>
  <SelectTrigger><SelectValue placeholder="국가 선택" /></SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>아시아</SelectLabel>
      <SelectItem value="kr">대한민국</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>유럽</SelectLabel>
      <SelectItem value="de">독일</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter의 ShUiSelect는 그룹/라벨/구분선을 직접 지원하지 않는다.
// 단순한 items 배열을 사용한다.
ShUiSelect<String>(
  value: _country,
  onChanged: (v) => setState(() => _country = v),
  placeholder: '국가 선택',
  items: const [
    ShUiSelectItem(value: 'kr', child: Text('대한민국')),
    ShUiSelectItem(value: 'jp', child: Text('일본')),
    ShUiSelectItem(value: 'de', child: Text('독일')),
    ShUiSelectItem(value: 'fr', child: Text('프랑스')),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>비활성 항목 / 전체 disabled</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Select>
              <SelectTrigger style={{ width: "11rem" }}>
                <SelectValue placeholder="플랜 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="team" disabled>Team (준비중)</SelectItem>
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger style={{ width: "11rem" }}>
                <SelectValue placeholder="선택 불가" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `{/* 항목 단위 비활성 */}
<Select>
  <SelectTrigger>
    <SelectValue placeholder="플랜 선택" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="free">Free</SelectItem>
    <SelectItem value="pro">Pro</SelectItem>
    <SelectItem value="team" disabled>Team (준비중)</SelectItem>
  </SelectContent>
</Select>

{/* 전체 비활성 */}
<Select disabled>
  <SelectTrigger>
    <SelectValue placeholder="선택 불가" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">A</SelectItem>
  </SelectContent>
</Select>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// 항목 단위 비활성
ShUiSelect<String>(
  value: _plan,
  onChanged: (v) => setState(() => _plan = v),
  placeholder: '플랜 선택',
  items: const [
    ShUiSelectItem(value: 'free', child: Text('Free')),
    ShUiSelectItem(value: 'pro', child: Text('Pro')),
    ShUiSelectItem(value: 'team', enabled: false, child: Text('Team (준비중)')),
  ],
)

// 전체 비활성
ShUiSelect<String>(
  value: null,
  onChanged: null,
  enabled: false,
  placeholder: '선택 불가',
  items: const [
    ShUiSelectItem(value: 'a', child: Text('A')),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>다중 선택 (MultiSelect)</h3>
      <Preview>
        <Preview.Demo>
          <MultiSelect>
            <SelectTrigger style={{ width: "18rem" }}>
              <MultiSelectValue placeholder="과일을 여러 개 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
            </SelectContent>
          </MultiSelect>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<MultiSelect>
  <SelectTrigger>
    <MultiSelectValue placeholder="과일을 여러 개 선택" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
  </SelectContent>
</MultiSelect>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter의 ShUiSelect는 아직 다중 선택(MultiSelect)을 지원하지 않는다.
// 단일 선택만 제공.`,
            },
          ]}
        />
      </Preview>

      <h3>Multi: 칩(chip) 형태로 표시</h3>
      <p className="muted">
        <code>render</code> prop으로 선택값 렌더링을 커스터마이즈. 기본은 쉼표 join.
      </p>
      <Preview>
        <Preview.Demo>
          <ChipMultiSelectDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<MultiSelect defaultValue={["apple", "grapes"]}>
  <SelectTrigger>
    <MultiSelectValue
      placeholder="과일 선택"
      render={(arr, { remove }) => (
        <span className="sh-ui-select__chips">
          {arr.map((v) => (
            <span key={v} className="sh-ui-select__chip">
              {v}
              <span
                role="button"
                tabIndex={0}
                aria-label={\`\${v} 제거\`}
                className="sh-ui-select__chip-remove"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(v); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    remove(v);
                  }
                }}
              >×</span>
            </span>
          ))}
        </span>
      )}
    />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="grapes">Grapes</SelectItem>
  </SelectContent>
</MultiSelect>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter의 ShUiSelect는 MultiSelect / chip 커스텀 렌더를 아직 지원하지 않는다.`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Select", description: <>루트. <code>value</code>, <code>defaultValue</code>, <code>onValueChange</code>, <code>disabled</code> 등 Base UI props 그대로.</> },
          { name: "SelectTrigger", description: "트리거 버튼. 열림 상태에 따라 아이콘이 회전." },
          { name: "SelectValue", description: "현재 선택값 또는 placeholder 표시." },
          { name: "SelectContent", description: "드롭다운 팝업 (Portal + Positioner + Popup 래퍼)." },
          { name: "SelectGroup", description: "항목 그룹." },
          { name: "SelectLabel", description: "그룹 라벨." },
          { name: "SelectItem", description: "선택 가능한 항목. 선택 시 체크 아이콘 표시." },
          { name: "SelectSeparator", description: "항목 사이 구분선." },
          { name: "MultiSelect", description: <><code>multiple</code> 모드 래퍼. value/onValueChange가 <code>string[]</code>.</> },
          { name: "MultiSelectValue", description: <>다중 선택 값 표시. <code>render</code> prop으로 칩 등 커스텀 가능.</> },
        ]}
      />

      <h2>API Reference</h2>

      <h3>SelectContent</h3>
      <PropsTable
        rows={[
          { prop: "container", type: "Element | RefObject", description: "Portal이 마운트될 노드. 기본 body. 토큰 스코프 안에 띄우려면 해당 컨테이너 ref 전달." },
        ]}
      />
    </main>
  );
}
