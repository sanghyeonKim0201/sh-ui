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
import { VariantSource } from "@/components/variant-source";
import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { ChipMultiSelectDemo } from "./_demos/chip-multi";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { SelectLiveDemo } from "./select-live-demo";

const sources = loadComponentSources("select");

export default function SelectPage() {
  return (
    <main className="container">
      <h1>Select</h1>
      <p className="muted">
        단일 선택 드롭다운. <a href="https://base-ui.com/react/components/select" target="_blank" rel="noreferrer">Base UI</a>의 headless primitive 위에 sh-ui 토큰 스타일을 입혔다.
      </p>

      <SelectLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
      />

      <details style={{ marginTop: "1rem" }}>
        <summary className="muted" style={{ cursor: "pointer" }}>Flutter 코드 보기</summary>
        <CodeTabs
          items={[
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
      </details>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add select`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add select

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_select.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="select" />
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `pnpm add @base-ui/react`,
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
            code: `// 단일 선택
String? value;

ShUiSelect<String>(
  value: value,
  onChanged: (v) => setState(() => value = v),
  placeholder: '선택하세요',
  items: const [
    ShUiSelectItem(value: 'apple', child: Text('Apple')),
  ],
)

// 다중 선택 (value: List<T>)
List<String> values = [];

ShUiMultiSelect<String>(
  value: values,
  onChanged: (v) => setState(() => values = v),
  placeholder: '여러 개 선택',
  elements: const [
    ShUiSelectItem(value: 'apple', child: Text('Apple')),
    ShUiSelectItem(value: 'banana', child: Text('Banana')),
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
              code: `// elements로 그룹/구분선/라벨을 구성한다.
// (기존 items와 상호 배타 — 구조화된 목록이면 elements 사용)
ShUiSelect<String>(
  value: _country,
  onChanged: (v) => setState(() => _country = v),
  placeholder: '국가 선택',
  elements: const [
    ShUiSelectGroup(
      label: '아시아',
      items: [
        ShUiSelectItem(value: 'kr', child: Text('대한민국')),
        ShUiSelectItem(value: 'jp', child: Text('일본')),
      ],
    ),
    ShUiSelectSeparator(),
    ShUiSelectGroup(
      label: '유럽',
      items: [
        ShUiSelectItem(value: 'de', child: Text('독일')),
        ShUiSelectItem(value: 'fr', child: Text('프랑스')),
      ],
    ),
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
              code: `List<String> values = [];

ShUiMultiSelect<String>(
  value: values,
  onChanged: (v) => setState(() => values = v),
  placeholder: '과일을 여러 개 선택',
  elements: const [
    ShUiSelectItem(value: 'apple', child: Text('Apple')),
    ShUiSelectItem(value: 'banana', child: Text('Banana')),
    ShUiSelectItem(value: 'grapes', child: Text('Grapes')),
  ],
)`,
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
              code: `// chipsBuilder로 트리거 내부 칩 렌더링을 커스터마이즈.
// 기본은 쉼표 join 텍스트.
List<String> values = ['apple', 'grapes'];

ShUiMultiSelect<String>(
  value: values,
  onChanged: (v) => setState(() => values = v),
  placeholder: '과일 선택',
  elements: const [
    ShUiSelectItem(value: 'apple', child: Text('Apple')),
    ShUiSelectItem(value: 'banana', child: Text('Banana')),
    ShUiSelectItem(value: 'grapes', child: Text('Grapes')),
  ],
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

      <h3>비동기 옵션 로딩</h3>
      <p className="muted">
        옵션을 서버에서 받아오는 패턴. 페치 동안에는 트리거를 <code>disabled</code> 로 잠그고 라벨에{" "}
        <code>Spinner</code> 를 끼워 진행을 알린다. 옵션 수가 고정적이고 검색이 필요 없을 때 적합하며,
        검색-as-you-type 이 필요하면 <a href="../combobox">Combobox</a> 를 쓰는 게 낫다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

function CountrySelect({
  value,
  onValueChange,
}: {
  value?: string;
  onValueChange: (v: string) => void;
}) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCountries()
      .then((data) => {
        if (!cancelled) setCountries(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={loading}>
      <SelectTrigger aria-busy={loading || undefined}>
        {loading ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Spinner size="sm" aria-label="국가 목록 불러오는 중" />
            불러오는 중…
          </span>
        ) : (
          <SelectValue placeholder="국가 선택" />
        )}
      </SelectTrigger>
      <SelectContent>
        {countries.map((c) => (
          <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `class CountrySelect extends StatefulWidget {
  final String? value;
  final ValueChanged<String?> onChanged;
  const CountrySelect({super.key, this.value, required this.onChanged});
  @override
  State<CountrySelect> createState() => _CountrySelectState();
}

class _CountrySelectState extends State<CountrySelect> {
  List<Country> _countries = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    fetchCountries().then((data) {
      if (mounted) setState(() {
        _countries = data;
        _loading = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: const [
          ShUiSpinner(size: ShUiSpinnerSize.sm),
          SizedBox(width: 8),
          Text('불러오는 중…'),
        ],
      );
    }
    return ShUiSelect<String>(
      value: widget.value,
      onChanged: widget.onChanged,
      placeholder: '국가 선택',
      items: _countries
          .map((c) => ShUiSelectItem(value: c.code, label: c.name))
          .toList(),
    );
  }
}`,
          },
        ]}
      />

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

      <h2>접근성</h2>
      <ul>
        <li><code>Space</code> / <code>Enter</code> / <code>↓</code> — 팝업 열기</li>
        <li><code>↑</code> / <code>↓</code> — 항목 이동, <code>Home</code> / <code>End</code> — 첫/마지막</li>
        <li>문자 타이핑 — type-ahead(해당 글자로 시작하는 항목으로 이동)</li>
        <li><code>Enter</code> — 선택, <code>Esc</code> — 닫기(변경 취소)</li>
        <li>Base UI가 <code>role=&quot;listbox&quot;</code>, <code>aria-selected</code>, <code>aria-expanded</code>를 자동 관리</li>
      </ul>
    </main>
  );
}
