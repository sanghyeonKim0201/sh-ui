export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { ComboboxBasicDemo } from "./_demos/basic";
import { ComboboxMultiChipsDemo } from "./_demos/multi-chips";

export default function ComboboxPage() {
  return (
    <main className="container">
      <h1>Combobox</h1>
      <p className="muted">
        Select + Input을 합친 검색 가능한 드롭다운. 타이핑에 따라 목록이 자동 필터링된다. <a href="https://base-ui.com/react/components/combobox" target="_blank" rel="noreferrer">Base UI Combobox</a> 위에 sh-ui 토큰 스타일을 얹음.
      </p>

      <Preview>
        <Preview.Demo>
          <ComboboxBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Combobox items={fruits}>
  <ComboboxInput placeholder="과일 검색..." />
  <ComboboxContent>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
    <ComboboxEmpty>일치하는 항목이 없습니다.</ComboboxEmpty>
  </ComboboxContent>
</Combobox>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// StatefulWidget 내부
String? _selected;

ShUiCombobox<String>(
  value: _selected,
  onChanged: (v) => setState(() => _selected = v),
  items: fruits
      .map((f) => ShUiComboboxItem(value: f, label: f))
      .toList(),
  placeholder: '과일 검색...',
  emptyText: '일치하는 항목이 없습니다.',
)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add combobox` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add combobox` },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        React는 registry에서 <code>components/ui/combobox/</code>로 복사하고 Base UI를 설치한다. Flutter는 <code>packages/registry/flutter/widgets/sh_ui_combobox.dart</code>를 <code>lib/widgets/</code>로 복사한다.
      </p>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `pnpm add @base-ui/react` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `# 추가 의존성 없음 — Material 기반` },
        ]}
      />

      <h2>Examples</h2>

      <h3>제어 모드</h3>
      <p className="muted">
        <code>value</code> + <code>onValueChange</code>로 선택 값을 외부 상태와 동기화.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `const [value, setValue] = useState<string | null>(null);

<Combobox items={fruits} value={value} onValueChange={setValue}>
  <ComboboxInput placeholder="과일 검색..." />
  <ComboboxContent>
    <ComboboxList>
      {(item) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `String? _value;

ShUiCombobox<String>(
  value: _value,
  onChanged: (v) => setState(() => _value = v),
  items: fruits
      .map((f) => ShUiComboboxItem(value: f, label: f))
      .toList(),
  placeholder: '과일 검색...',
)`,
          },
        ]}
      />

      <h3>다중 선택 + 칩</h3>
      <p className="muted">
        <code>multiple</code>로 전환. <code>ComboboxChips</code> 래퍼 안에 <code>ComboboxChip</code>과 <code>ComboboxChipRemove</code>를 배치하면 선택된 항목이 칩으로 표시되고, × 버튼으로 개별 제거된다.
      </p>
      <Preview>
        <Preview.Demo>
          <ComboboxMultiChipsDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Combobox items={cities} multiple>
  <ComboboxChips>
    <ComboboxValue>
      {(values) =>
        values.map((v) => (
          <ComboboxChip key={v}>
            {v}
            <ComboboxChipRemove />
          </ComboboxChip>
        ))
      }
    </ComboboxValue>
    <ComboboxInput placeholder="도시 추가..." />
  </ComboboxChips>
  <ComboboxContent>
    <ComboboxList>
      {(item) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// ShUiMultiCombobox: 검색 + 다중 선택 + 칩 표시.
// 기본 칩은 입력 위에 자동 렌더. chipsBuilder로 커스터마이즈 가능.
List<String> cities = [];

ShUiMultiCombobox<String>(
  value: cities,
  onChanged: (v) => setState(() => cities = v),
  items: ['서울', '부산', '대구', '인천']
      .map((c) => ShUiComboboxItem(value: c, label: c))
      .toList(),
  placeholder: '도시 추가...',
)

// 커스텀 칩 렌더러
ShUiMultiCombobox<String>(
  value: cities,
  onChanged: (v) => setState(() => cities = v),
  items: items,
  placeholder: '도시 추가...',
  chipsBuilder: (values, onRemove) => Wrap(
    spacing: 4,
    runSpacing: 4,
    children: values
        .map((v) => ShUiSelectChip(
              label: v,
              onRemove: () => onRemove(v),
            ))
        .toList(),
  ),
)`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Combobox", description: "루트. items/value/onValueChange/multiple 등 Base UI props 그대로." },
          { name: "ComboboxInput", description: "검색어를 입력하는 input. 트리거 역할도 겸함." },
          { name: "ComboboxContent", description: "Portal + Positioner + Popup 래퍼 (드롭다운 팝업)." },
          { name: "ComboboxList", description: "필터된 items를 순회하며 children(item) 함수로 렌더." },
          { name: "ComboboxItem", description: "선택 가능한 항목. 체크 아이콘 자동 표시." },
          { name: "ComboboxEmpty", description: "필터 결과가 없을 때 표시되는 영역." },
          { name: "ComboboxGroup", description: "그룹 래퍼." },
          { name: "ComboboxGroupLabel", description: "그룹 라벨." },
          { name: "ComboboxChips", description: "다중 선택 칩 컨테이너 (input 포함)." },
          { name: "ComboboxChip", description: "선택된 항목 하나의 칩." },
          { name: "ComboboxChipRemove", description: "칩에서 개별 항목을 제거하는 × 버튼." },
          { name: "ComboboxClear", description: "input 값을 지우는 버튼." },
          { name: "ComboboxIcon", description: "드롭다운 화살표 아이콘." },
          { name: "ComboboxTrigger", description: "input 옆의 보조 트리거 버튼(선택)." },
          { name: "ComboboxValue", description: "현재 선택된 값을 children 함수로 렌더 (칩 렌더링 등)." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>Combobox</h3>
      <PropsTable
        rows={[
          { prop: "items", type: "T[]", description: "필터링 대상이 되는 항목 배열." },
          { prop: "value", type: "T | T[] | null", description: "선택 값 (제어 모드)." },
          { prop: "defaultValue", type: "T | T[] | null", description: "비제어 모드 초기값." },
          { prop: "onValueChange", type: "(value) => void", description: "선택 변경 콜백." },
          { prop: "multiple", type: "boolean", default: "false", description: "다중 선택 모드." },
          { prop: "inputValue", type: "string", description: "입력값 (제어)." },
          { prop: "onInputValueChange", type: "(value: string) => void", description: "입력값 변경 콜백." },
          { prop: "filter", type: "(item, query) => boolean | null", description: "커스텀 필터. null이면 비활성." },
          { prop: "itemToStringLabel", type: "(item) => string", description: "복잡한 item 객체에서 라벨 추출." },
          { prop: "autoHighlight", type: "boolean", description: "첫 항목 자동 하이라이트." },
          { prop: "openOnInputClick", type: "boolean", default: "true", description: "input 클릭 시 드롭다운 열기." },
        ]}
      />

      <h3>ComboboxItem</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "T", description: "항목 값. 선택 시 onValueChange에 전달." },
          { prop: "disabled", type: "boolean", description: "비활성 항목." },
        ]}
      />

      <h3>ComboboxContent</h3>
      <PropsTable
        rows={[
          { prop: "sideOffset", type: "number", default: "4", description: "input과의 간격 (px)." },
          { prop: "container", type: "Element | null", description: "Portal 마운트 노드." },
        ]}
      />

      <h3>ComboboxChipRemove</h3>
      <PropsTable
        rows={[
          { prop: "children", type: "ReactNode", default: `"×"`, description: "버튼 텍스트/아이콘." },
        ]}
      />

      <h2>접근성</h2>
      <ul>
        <li>입력에 문자 타이핑 — 실시간 필터링</li>
        <li><code>↓</code> / <code>↑</code> — 결과 항목 이동</li>
        <li><code>Enter</code> — 선택, <code>Esc</code> — 닫기</li>
        <li>Backspace(빈 입력) — multiselect에서 마지막 chip 제거</li>
        <li>Base UI가 <code>role=&quot;combobox&quot;</code>, <code>aria-expanded</code>, <code>aria-activedescendant</code>를 자동 관리</li>
      </ul>
    </main>
  );
}
