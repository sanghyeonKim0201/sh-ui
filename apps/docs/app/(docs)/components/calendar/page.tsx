export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import {
  BasicDemo,
  SingleControlledDemo,
  MultipleDemo,
  RangeDemo,
  TwoMonthsDemo,
  MinMaxDemo,
  DisabledDatesDemo,
  MondayStartDemo,
  NoOutsideDaysDemo,
  CompoundMonthOnlyDemo,
  CompoundYearOnlyDemo,
  CompoundNoArrowsDemo,
} from "./_demos/basic";
import { VariantSource } from "@/components/variant-source";

export default function CalendarPage() {
  return (
    <main className="container">
      <h1>Calendar</h1>
      <p className="muted">
        인라인 캘린더 primitive. 단일·다중·범위 선택을 모두 지원하고, popover 안에 띄우려면{" "}
        <code>DatePicker</code> / <code>DateRangePicker</code> 를 사용한다.
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
              code: `<Calendar />`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add calendar` },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="calendar" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "@/components/ui/calendar";

// 기본 (single)
<Calendar />

// Controlled
const [date, setDate] = useState<Date | undefined>(new Date());
<Calendar value={date} onValueChange={setDate} />

// 다중 선택
const [dates, setDates] = useState<Date[]>([]);
<Calendar mode="multiple" value={dates} onValueChange={setDates} />

// 범위 선택
const [range, setRange] = useState<DateRange | undefined>();
<Calendar mode="range" value={range} onValueChange={setRange} />`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>Single — Controlled</h3>
      <Preview>
        <Preview.Demo>
          <SingleControlledDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [date, setDate] = useState<Date | undefined>(new Date());

<Calendar value={date} onValueChange={setDate} />`,
            },
          ]}
        />
      </Preview>

      <h3>Multiple — 여러 날짜 토글</h3>
      <Preview>
        <Preview.Demo>
          <MultipleDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [dates, setDates] = useState<Date[]>([]);

<Calendar mode="multiple" value={dates} onValueChange={setDates} />`,
            },
          ]}
        />
      </Preview>

      <h3>Range — 시작/종료일 두 번 클릭</h3>
      <p className="muted">
        첫 번째 클릭으로 시작일이 잡히고, 두 번째 클릭과 동시에 범위가 확정되어 <code>onValueChange</code>가 호출된다.
        호버 중에는 미리보기 범위가 하이라이트된다.
      </p>
      <Preview>
        <Preview.Demo>
          <RangeDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [range, setRange] = useState<DateRange | undefined>();

<Calendar mode="range" value={range} onValueChange={setRange} />`,
            },
          ]}
        />
      </Preview>

      <h3>두 달 동시 표시</h3>
      <Preview>
        <Preview.Demo>
          <TwoMonthsDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Calendar mode="range" numberOfMonths={2} />`,
            },
          ]}
        />
      </Preview>

      <h3>min / max 로 범위 제한</h3>
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

<Calendar min={min} max={max} />`,
            },
          ]}
        />
      </Preview>

      <h3>특정 날짜 비활성 (주말 제외)</h3>
      <Preview>
        <Preview.Demo>
          <DisabledDatesDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Calendar
  disabled={(d) => d.getDay() === 0 || d.getDay() === 6}
/>`,
            },
          ]}
        />
      </Preview>

      <h3>월요일 시작 / 외부 날짜 숨기기</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <MondayStartDemo />
            <NoOutsideDaysDemo />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Calendar weekStartsOn={1} />
<Calendar showOutsideDays={false} />`,
            },
          ]}
        />
      </Preview>

      <h2>Compound 조립</h2>
      <p className="muted">
        children 으로 헤더 파츠를 직접 조립하면 화살표를 선택적으로 노출할 수 있다.
        compound 모드에서는 단일 월(<code>numberOfMonths</code> 1) 로 강제된다.
      </p>

      <h3>월 화살표만 (년 단위 화살표 제거)</h3>
      <Preview>
        <Preview.Demo>
          <CompoundMonthOnlyDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Calendar>
  <CalendarHeader>
    <CalendarPrevMonthButton />
    <CalendarYearSelect />
    <CalendarMonthSelect />
    <CalendarNextMonthButton />
  </CalendarHeader>
  <CalendarGrid />
</Calendar>`,
            },
          ]}
        />
      </Preview>

      <h3>년 화살표만</h3>
      <Preview>
        <Preview.Demo>
          <CompoundYearOnlyDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Calendar>
  <CalendarHeader>
    <CalendarPrevYearButton />
    <CalendarYearSelect />
    <CalendarMonthSelect />
    <CalendarNextYearButton />
  </CalendarHeader>
  <CalendarGrid />
</Calendar>`,
            },
          ]}
        />
      </Preview>

      <h3>화살표 없이 dropdown 만</h3>
      <Preview>
        <Preview.Demo>
          <CompoundNoArrowsDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Calendar>
  <CalendarHeader>
    <CalendarYearSelect />
    <CalendarMonthSelect />
  </CalendarHeader>
  <CalendarGrid />
</Calendar>`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Calendar", description: "루트. 모드/값/표시월/year-options 를 Context로 제공. children 생략 시 기본 레이아웃 자동 렌더." },
          { name: "CalendarHeader", description: "헤더 컨테이너. 화살표/dropdown 등을 자유롭게 배치." },
          { name: "CalendarPrevYearButton", description: "1년 이전. ‹‹ 아이콘 기본." },
          { name: "CalendarNextYearButton", description: "1년 다음. ›› 아이콘 기본." },
          { name: "CalendarPrevMonthButton", description: "1개월 이전. ‹ 아이콘 기본." },
          { name: "CalendarNextMonthButton", description: "1개월 다음. › 아이콘 기본." },
          { name: "CalendarYearSelect", description: "연도 dropdown. fromYear/toYear 범위에서 선택." },
          { name: "CalendarMonthSelect", description: "월 dropdown. 1월~12월." },
          { name: "CalendarGrid", description: "요일 헤더 + 일자 그리드." },
          { name: "useCalendar", description: "visibleMonth / 탐색 핸들러를 직접 다룰 때 사용하는 훅." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>Common</h3>
      <PropsTable
        rows={[
          { prop: "mode", type: `"single" | "multiple" | "range"`, default: `"single"`, description: "선택 모드. value/defaultValue/onValueChange 시그니처가 모드에 따라 결정된다." },
          { prop: "month", type: "Date", description: "표시 중인 월 (controlled). 일자 부분은 무시되고 월 단위로만 사용." },
          { prop: "defaultMonth", type: "Date", description: "표시 월 초기값 (uncontrolled)." },
          { prop: "onMonthChange", type: "(month: Date) => void", description: "표시 월 변경 콜백." },
          { prop: "numberOfMonths", type: "number", default: "1", description: "동시에 표시할 월 개수." },
          { prop: "min", type: "Date", description: "선택 가능 최소 날짜 (포함)." },
          { prop: "max", type: "Date", description: "선택 가능 최대 날짜 (포함)." },
          { prop: "disabled", type: "(date: Date) => boolean", description: "날짜별 비활성 콜백. min/max 와 함께 적용." },
          { prop: "showOutsideDays", type: "boolean", default: "true", description: "이전/다음 달 날짜 표시 여부." },
          { prop: "weekStartsOn", type: "0 | 1", default: "0", description: "주 시작 요일. 0=일, 1=월." },
          { prop: "weekdayLabels", type: "readonly string[]", default: `["일","월","화","수","목","금","토"]`, description: "요일 라벨 (Sunday-first 7개). weekStartsOn 에 맞춰 회전된다." },
          { prop: "formatMonthLabel", type: "(year: number, month: number) => string", default: `"YYYY년 M월"`, description: "월 헤더 그룹의 aria-label 포맷." },
          { prop: "fromYear", type: "number", default: "min?.getFullYear() ?? 현재−10", description: "연도 dropdown 의 시작 연도." },
          { prop: "toYear", type: "number", default: "max?.getFullYear() ?? 현재+10", description: "연도 dropdown 의 끝 연도." },
          { prop: "className", type: "string", description: "캘린더 컨테이너 클래스." },
          { prop: "aria-label", type: "string", description: "그리드 aria-label. 미지정 시 월 라벨 사용." },
        ]}
      />

      <h3>mode = &quot;single&quot;</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "Date", description: "선택 날짜 (controlled)." },
          { prop: "defaultValue", type: "Date", description: "초기 선택 날짜 (uncontrolled)." },
          { prop: "onValueChange", type: "(date: Date | undefined) => void", description: "선택 변경 콜백." },
        ]}
      />

      <h3>mode = &quot;multiple&quot;</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "Date[]", description: "선택된 날짜들 (controlled)." },
          { prop: "defaultValue", type: "Date[]", description: "초기 선택 (uncontrolled)." },
          { prop: "onValueChange", type: "(dates: Date[]) => void", description: "토글 시 호출." },
        ]}
      />

      <h3>mode = &quot;range&quot;</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "DateRange", description: "선택된 범위 { from, to } (controlled)." },
          { prop: "defaultValue", type: "DateRange", description: "초기 범위 (uncontrolled)." },
          { prop: "onValueChange", type: "(range: DateRange | undefined) => void", description: "범위 확정(2번째 클릭) 시 호출. 첫 번째 클릭 단계에서는 호출되지 않는다." },
        ]}
      />

      <h3>키보드 내비게이션</h3>
      <PropsTable
        rows={[
          { prop: "←→", type: "", description: "하루 이동." },
          { prop: "↑↓", type: "", description: "한 주 이동." },
          { prop: "PageUp / PageDown", type: "", description: "한 달 이동." },
          { prop: "Home / End", type: "", description: "월의 시작/끝으로 이동." },
          { prop: "Enter / Space", type: "", description: "현재 커서 날짜 선택." },
        ]}
      />
    </main>
  );
}
