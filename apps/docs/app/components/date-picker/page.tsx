export const dynamic = "force-static";

import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import {
  BasicDemo,
  ControlledDemo,
  MinMaxDemo,
  StatesDemo,
  WithLabelDemo,
  RangeBasicDemo,
  RangeControlledDemo,
  RangeWithLabelDemo,
} from "./_demos/basic";

export default function DatePickerPage() {
  return (
    <main className="container">
      <h1>DatePicker</h1>
      <p className="muted">
        캘린더 팝오버를 통해 날짜를 선택하는 컴포넌트. 단일 날짜와 범위 선택을 모두 지원한다.
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
              code: `<DatePicker placeholder="날짜를 선택하세요" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiDatePicker(placeholder: '날짜를 선택하세요')`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui add date-picker` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui add date-picker` },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 복사한다.
      </p>
      <ul>
        <li>React: <code>components/ui/date-picker/index.tsx</code>, <code>styles.css</code></li>
        <li>Flutter: <code>packages/registry/flutter/widgets/sh_ui_date_picker.dart</code> → <code>lib/widgets/</code></li>
      </ul>

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { DatePicker, DateRangePicker } from "@/components/ui/date-picker";
import type { DateRange } from "@/components/ui/date-picker";

// 단일 날짜
<DatePicker placeholder="날짜 선택" />

// Controlled
const [date, setDate] = useState<Date | undefined>(new Date());
<DatePicker value={date} onValueChange={setDate} />

// 범위 선택
const [range, setRange] = useState<DateRange | undefined>();
<DateRangePicker value={range} onValueChange={setRange} />`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import 'widgets/sh_ui_date_picker.dart';

// 단일 날짜
const ShUiDatePicker(placeholder: '날짜 선택'),

// Controlled (StatefulWidget 내부)
DateTime? _date;

ShUiDatePicker(
  value: _date,
  onValueChange: (d) => setState(() => _date = d),
),

// 범위 선택
DateTimeRange? _range;

ShUiDateRangePicker(
  value: _range,
  onValueChange: (r) => setState(() => _range = r),
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>Controlled</h3>
      <Preview>
        <Preview.Demo>
          <ControlledDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [date, setDate] = useState<Date | undefined>(new Date());

<DatePicker value={date} onValueChange={setDate} />
<p>선택: {date ? date.toLocaleDateString("ko-KR") : "없음"}</p>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `DateTime? _date = DateTime.now();

ShUiDatePicker(
  value: _date,
  onValueChange: (d) => setState(() => _date = d),
),
Text('선택: \${_date != null ? _date!.toString().split(' ')[0] : '없음'}'),`,
            },
          ]}
        />
      </Preview>

      <h3>상태</h3>
      <Preview>
        <Preview.Demo>
          <StatesDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<DatePicker defaultValue={new Date()} />
<DatePicker placeholder="disabled" disabled />
<DatePicker defaultValue={new Date()} readOnly />
<DatePicker placeholder="invalid" aria-invalid />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter ShUiDatePicker는 enabled만 지원 (readOnly / invalid 상태는 미구현).
ShUiDatePicker(value: DateTime.now()),
const ShUiDatePicker(placeholder: 'disabled', enabled: false),`,
            },
          ]}
        />
      </Preview>

      <h3>날짜 범위 제한 (min / max)</h3>
      <Preview>
        <Preview.Demo>
          <MinMaxDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const today = new Date();
const min = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
const max = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

<DatePicker min={min} max={max} placeholder="오늘 기준 -7일 ~ +30일" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `final now = DateTime.now();

ShUiDatePicker(
  min: now.subtract(const Duration(days: 7)),
  max: now.add(const Duration(days: 30)),
  placeholder: '오늘 기준 -7일 ~ +30일',
)`,
            },
          ]}
        />
      </Preview>

      <h3>Label과 함께</h3>
      <Preview>
        <Preview.Demo>
          <WithLabelDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Label htmlFor="birth" isRequired>생년월일</Label>
<DatePicker placeholder="YYYY-MM-DD" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiLabel(
  isRequired: true,
  child: ShUiLabelTitle('생년월일'),
),
const SizedBox(height: 4),
const ShUiDatePicker(placeholder: 'YYYY-MM-DD'),`,
            },
          ]}
        />
      </Preview>

      <h2>DateRangePicker</h2>
      <p className="muted">
        시작일과 종료일을 순서대로 클릭하여 범위를 선택한다. 호버 시 선택 예정 범위가 하이라이트된다.
      </p>

      <h3>기본</h3>
      <Preview>
        <Preview.Demo>
          <RangeBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<DateRangePicker placeholder="시작일 ~ 종료일" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiDateRangePicker(placeholder: '시작일 ~ 종료일')`,
            },
          ]}
        />
      </Preview>

      <h3>Controlled</h3>
      <Preview>
        <Preview.Demo>
          <RangeControlledDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [range, setRange] = useState<DateRange | undefined>();

<DateRangePicker value={range} onValueChange={setRange} />
<p>{range
  ? \`\${range.from.toLocaleDateString("ko-KR")} ~ \${range.to.toLocaleDateString("ko-KR")}\`
  : "미선택"}</p>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `DateTimeRange? _range;

ShUiDateRangePicker(
  value: _range,
  onValueChange: (r) => setState(() => _range = r),
),
Text(_range != null
    ? '\${_range!.start.toString().split(' ')[0]} ~ \${_range!.end.toString().split(' ')[0]}'
    : '미선택'),`,
            },
          ]}
        />
      </Preview>

      <h3>Label + min 제한</h3>
      <Preview>
        <Preview.Demo>
          <RangeWithLabelDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Label isRequired>투숙 기간</Label>
<DateRangePicker min={new Date()} placeholder="체크인 ~ 체크아웃" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiLabel(
  isRequired: true,
  child: ShUiLabelTitle('투숙 기간'),
),
const SizedBox(height: 4),
ShUiDateRangePicker(
  min: DateTime.now(),
  placeholder: '체크인 ~ 체크아웃',
),`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "DatePicker", description: "단일 날짜 선택. 캘린더 팝오버 + 트리거 버튼." },
          { name: "DateRangePicker", description: "시작일~종료일 범위 선택. 2회 클릭으로 범위 확정." },
          { name: "DateRange", description: "{ from: Date; to: Date } 타입." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>DatePicker</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "Date", description: "선택된 날짜 (controlled)." },
          { prop: "defaultValue", type: "Date", description: "초기 선택 날짜 (uncontrolled)." },
          { prop: "onValueChange", type: "(date: Date | undefined) => void", description: "날짜 변경 콜백." },
          { prop: "formatDate", type: "(date: Date) => string", default: "YYYY-MM-DD", description: "트리거에 표시할 날짜 포맷 함수." },
          { prop: "min", type: "Date", description: "선택 가능 최소 날짜." },
          { prop: "max", type: "Date", description: "선택 가능 최대 날짜." },
          { prop: "placeholder", type: "string", default: `"날짜 선택"`, description: "날짜 미선택 시 플레이스홀더." },
          { prop: "disabled", type: "boolean" },
          { prop: "readOnly", type: "boolean" },
          { prop: "aria-invalid", type: `boolean | "true"`, description: "에러 상태. 보더가 --danger로 전환." },
        ]}
      />

      <h3>DateRangePicker</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "DateRange", description: "선택된 범위 (controlled). { from, to }." },
          { prop: "defaultValue", type: "DateRange", description: "초기 범위 (uncontrolled)." },
          { prop: "onValueChange", type: "(range: DateRange | undefined) => void", description: "범위 변경 콜백." },
          { prop: "formatDate", type: "(date: Date) => string", default: "YYYY-MM-DD", description: "트리거에 표시할 날짜 포맷 함수." },
          { prop: "min", type: "Date", description: "선택 가능 최소 날짜." },
          { prop: "max", type: "Date", description: "선택 가능 최대 날짜." },
          { prop: "placeholder", type: "string", default: `"시작일 ~ 종료일"`, description: "범위 미선택 시 플레이스홀더." },
          { prop: "disabled", type: "boolean" },
          { prop: "readOnly", type: "boolean" },
          { prop: "aria-invalid", type: `boolean | "true"`, description: "에러 상태." },
        ]}
      />

      <h3>키보드 내비게이션</h3>
      <PropsTable
        rows={[
          { prop: "←→", type: "", description: "하루 이동." },
          { prop: "↑↓", type: "", description: "한 주 이동." },
          { prop: "Enter / Space", type: "", description: "날짜 선택." },
          { prop: "Escape", type: "", description: "팝오버 닫기." },
        ]}
      />
    </main>
  );
}
