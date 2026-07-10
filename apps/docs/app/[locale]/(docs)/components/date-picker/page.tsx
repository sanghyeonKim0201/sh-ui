export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import {
  ControlledDemo,
  MinMaxDemo,
  StatesDemo,
  WithLabelDemo,
  RangeBasicDemo,
  RangeControlledDemo,
  RangeWithLabelDemo,
  LocaleEnDemo,
  RangeLocaleJaDemo,
  CompoundDemo,
  CustomTriggerDemo,
  DateTimeDemo,
} from "./_demos/basic";
import { VariantSource } from "@/components/variant-source";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { DatePickerLiveDemo } from "./date-picker-live-demo";

const sources = loadComponentSources("date-picker");

export default function DatePickerPage() {
  return (
    <main className="container">
      <h1>DatePicker</h1>
      <p className="muted">
        캘린더 팝오버를 통해 날짜를 선택하는 컴포넌트. 단일 날짜와 범위 선택을 모두 지원한다.
      </p>

      <DatePickerLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
      />

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add date-picker` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add date-picker` },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="date-picker" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import {
  DatePicker,
  DatePickerTrigger,
  DatePickerContent,
  DatePickerCalendar,
  DatePickerFooter,
  DateRangePicker,
} from "@/components/ui/date-picker";
import type { DateRange } from "@/components/ui/date-picker";

// 기본 (children 생략 시 Trigger + Content + Calendar 자동 렌더)
<DatePicker placeholder="날짜 선택" />

// Controlled
const [date, setDate] = useState<Date | undefined>(new Date());
<DatePicker value={date} onValueChange={setDate} />

// Compound 조립 모드 (footer 추가 등 커스터마이징)
<DatePicker value={date} onValueChange={setDate} closeOnSelect={false}>
  <DatePickerTrigger />
  <DatePickerContent>
    <DatePickerCalendar />
    <DatePickerFooter>
      {/* 오늘 / 지우기 버튼 등 */}
    </DatePickerFooter>
  </DatePickerContent>
</DatePicker>

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
<DatePicker id="birth" placeholder="YYYY-MM-DD" />`,
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

      <h3>Compound 조립 (Footer 추가)</h3>
      <p className="muted">
        children으로 Trigger/Content/Calendar/Footer를 조립하면 레이아웃을 자유롭게 커스터마이징할 수 있다.
        <code>useDatePicker()</code> 훅으로 Footer 내부에서 value/open 상태를 제어한다.
      </p>
      <Preview>
        <Preview.Demo>
          <CompoundDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `function TodayClearActions() {
  const { setValue, setFocusedDate, setOpen } = useDatePicker();
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => {
        const today = new Date();
        setValue(today);
        setFocusedDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setOpen(false);
      }}>오늘</Button>
      <Button variant="ghost" size="sm" onClick={() => {
        setValue(undefined);
        setOpen(false);
      }}>지우기</Button>
    </>
  );
}

<DatePicker value={date} onValueChange={setDate} closeOnSelect={false}>
  <DatePickerTrigger />
  <DatePickerContent>
    <DatePickerCalendar />
    <DatePickerFooter>
      <TodayClearActions />
    </DatePickerFooter>
  </DatePickerContent>
</DatePicker>`,
            },
          ]}
        />
      </Preview>

      <h3>커스텀 트리거 (render prop)</h3>
      <p className="muted">
        <code>DatePickerTrigger</code>의 children에 함수를 전달하면 value/formatted/placeholder를 받아 자유롭게 렌더한다.
      </p>
      <Preview>
        <Preview.Demo>
          <CustomTriggerDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<DatePicker value={date} onValueChange={setDate}>
  <DatePickerTrigger>
    {({ formatted, placeholder }) => (
      <span>{formatted ?? placeholder}</span>
    )}
  </DatePickerTrigger>
  <DatePickerContent>
    <DatePickerCalendar />
  </DatePickerContent>
</DatePicker>`,
            },
          ]}
        />
      </Preview>

      <h3>날짜 + 시간 선택 (캘린더 팝오버 안 TimePicker)</h3>
      <p className="muted">
        <code>DatePicker</code>를 compound 모드로 조립하고 <code>DatePickerContent</code> 안(캘린더 아래
        <code>DatePickerFooter</code>)에 <code>TimePicker</code>를 넣으면, <b>하나의 팝오버</b>에서 날짜와 시간을
        이어서 선택할 수 있다. <code>TimePicker</code>의 children으로 <code>TimePickerField</code>만 주면 자체
        트리거·팝오버 없이 세그먼트만 인라인 렌더된다. <code>closeOnSelect={"{false}"}</code>로 날짜 선택 후에도
        팝오버가 닫히지 않으며, 날짜/시간은 하나의 <code>Date</code> 상태를 공유해 서로를 보존한다.
      </p>
      <Preview>
        <Preview.Demo>
          <DateTimeDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import {
  DatePicker, DatePickerTrigger, DatePickerContent, DatePickerCalendar, DatePickerFooter,
} from "@/components/ui/date-picker";
import { TimePicker, TimePickerField } from "@/components/ui/time-picker";

const [dateTime, setDateTime] = useState<Date | undefined>();

// 날짜를 바꿔도 기존 시각(시/분/초)을 보존
const handleDateChange = (date: Date | undefined) => {
  if (!date) return setDateTime(undefined);
  setDateTime((prev) => {
    const next = new Date(date);
    if (prev) next.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds(), 0);
    return next;
  });
};

<DatePicker
  value={dateTime}
  onValueChange={handleDateChange}
  closeOnSelect={false}
  formatDate={(d) => \`\${d.toLocaleDateString()} \${d.getHours()}:\${d.getMinutes()}\`}
>
  <DatePickerTrigger />
  <DatePickerContent>
    <DatePickerCalendar />
    <DatePickerFooter>
      <span>시간</span>
      {/* children=TimePickerField → 트리거·팝오버 없이 세그먼트만 인라인 */}
      <TimePicker value={dateTime} onValueChange={setDateTime}>
        <TimePickerField />
      </TimePicker>
    </DatePickerFooter>
  </DatePickerContent>
</DatePicker>`,
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
              code: `<Label htmlFor="stay" isRequired>투숙 기간</Label>
<DateRangePicker id="stay" min={new Date()} placeholder="체크인 ~ 체크아웃" />`,
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

      <h2>다국어 (i18n)</h2>
      <p className="muted">
        <code>locale</code> prop 한 줄로 placeholder 와 내부 캘린더 라벨이 모두 해당 언어로 전환된다. ko/en 외 언어는
        nav/select aria-label 이 fallback 영어 — <code>messages</code> 로 직접 override 가능. 자세한 내용은{" "}
        <code>Calendar</code> 페이지 참조.
      </p>

      <h3>English (en-US)</h3>
      <Preview>
        <Preview.Demo>
          <LocaleEnDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<DatePicker locale="en-US" />`,
            },
          ]}
        />
      </Preview>

      <h3>日本語 (ja-JP) — DateRangePicker</h3>
      <Preview>
        <Preview.Demo>
          <RangeLocaleJaDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<DateRangePicker locale="ja-JP" />`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "DatePicker", description: "루트. value/open/focusedDate 상태를 Context로 제공. children 생략 시 Trigger + Content + Calendar 자동 렌더." },
          { name: "DatePickerTrigger", description: "팝오버를 여는 버튼. 기본은 날짜 문자열 + calendar 아이콘, children에 render prop 전달 가능." },
          { name: "DatePickerContent", description: "Popover Portal/Positioner/Popup 래퍼." },
          { name: "DatePickerCalendar", description: "달력 그리드. month navigation + day selection." },
          { name: "DatePickerFooter", description: "하단 액션 영역. 오늘/지우기 등 버튼 배치." },
          { name: "useDatePicker", description: "Footer 내부에서 value/open/focusedDate를 제어하기 위한 훅." },
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
          { prop: "placeholder", type: "string", default: "locale 기반 자동", description: "날짜 미선택 시 플레이스홀더. 미지정 시 locale 에서 파생 (ko: \"날짜 선택\", 그 외: \"Select date\")." },
          { prop: "locale", type: "string", default: `"ko-KR"`, description: "BCP47 로케일. 내부 Calendar 와 placeholder 기본값에 모두 적용." },
          { prop: "messages", type: "CalendarMessages", description: "내부 Calendar 의 nav/select aria-label override." },
          { prop: "disabled", type: "boolean" },
          { prop: "readOnly", type: "boolean" },
          { prop: "aria-invalid", type: `boolean | "true"`, description: "에러 상태. 보더가 --danger로 전환." },
          { prop: "closeOnSelect", type: "boolean", default: "true", description: "날짜 선택 시 팝오버 자동 닫기. Footer 액션을 노출하려면 false." },
          { prop: "container", type: "HTMLElement | RefObject<HTMLElement | null>", default: "document.body", description: "Portal 마운트 노드. 다크 모드를 page subtree 에만 입힌 환경(playground 캔버스 등)에서 캘린더가 토큰 스코프를 벗어나지 않도록 컨테이너 ref 전달." },
          { prop: "children", type: "ReactNode", description: "조립 모드. 생략 시 Trigger + Content + Calendar가 자동 렌더." },
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
          { prop: "placeholder", type: "string", default: "locale 기반 자동", description: "범위 미선택 시 플레이스홀더. 미지정 시 locale 에서 파생 (ko: \"시작일 ~ 종료일\", 그 외: \"Start date – end date\")." },
          { prop: "locale", type: "string", default: `"ko-KR"`, description: "BCP47 로케일. 내부 Calendar 와 placeholder 기본값에 모두 적용." },
          { prop: "messages", type: "CalendarMessages", description: "내부 Calendar 의 nav/select aria-label override." },
          { prop: "disabled", type: "boolean" },
          { prop: "readOnly", type: "boolean" },
          { prop: "aria-invalid", type: `boolean | "true"`, description: "에러 상태." },
          { prop: "container", type: "HTMLElement | RefObject<HTMLElement | null>", default: "document.body", description: "Portal 마운트 노드. DatePicker 와 동일." },
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
