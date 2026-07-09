export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import {
  ControlledDemo,
  SecondsDemo,
  Hour12Demo,
  StepDemo,
  MinMaxDemo,
  StatesDemo,
  WithLabelDemo,
  CompoundDemo,
} from "./_demos/basic";
import { VariantSource } from "@/components/variant-source";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { TimePickerLiveDemo } from "./time-picker-live-demo";

const sources = loadComponentSources("time-picker");

export default function TimePickerPage() {
  return (
    <main className="container">
      <h1>TimePicker</h1>
      <p className="muted">
        팝오버 세그먼트 스피너로 시각(시·분·초)을 선택하는 컴포넌트. 24/12시간제·초 표시·분/초 간격·min/max
        범위 제한을 모두 지원한다.
      </p>

      <TimePickerLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
      />

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add time-picker` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add time-picker` },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="time-picker" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import {
  TimePicker,
  TimePickerTrigger,
  TimePickerContent,
  TimePickerField,
  TimePickerFooter,
  useTimePicker,
} from "@/components/ui/time-picker";

// 기본 (children 생략 시 Trigger + Content + Field 자동 렌더)
<TimePicker placeholder="시간 선택" />

// Controlled
const [time, setTime] = useState<Date | undefined>(new Date());
<TimePicker value={time} onValueChange={setTime} />

// 12시간제 + 초
<TimePicker hour12 showSeconds />

// Compound 조립 모드 (Footer 추가 등 커스터마이징)
<TimePicker value={time} onValueChange={setTime}>
  <TimePickerTrigger />
  <TimePickerContent>
    <TimePickerField />
    <TimePickerFooter>
      {/* 지금 / 지우기 버튼 등 */}
    </TimePickerFooter>
  </TimePickerContent>
</TimePicker>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import 'widgets/sh_ui_time_picker.dart';

// 기본
const ShUiTimePicker(placeholder: '시간 선택'),

// Controlled (StatefulWidget 내부)
DateTime? _time;

ShUiTimePicker(
  value: _time,
  onValueChange: (t) => setState(() => _time = t),
),

// 12시간제 + 초
const ShUiTimePicker(hour12: true, showSeconds: true),`,
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
              code: `const [time, setTime] = useState<Date | undefined>(new Date());

<TimePicker value={time} onValueChange={setTime} />
<p>선택: {time ? time.toLocaleTimeString("ko-KR") : "없음"}</p>`,
            },
          ]}
        />
      </Preview>

      <h3>12시간제 (AM/PM)</h3>
      <Preview>
        <Preview.Demo>
          <Hour12Demo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<TimePicker hour12 locale="en-US" />`,
            },
          ]}
        />
      </Preview>

      <h3>초 표시 (showSeconds)</h3>
      <Preview>
        <Preview.Demo>
          <SecondsDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<TimePicker showSeconds />`,
            },
          ]}
        />
      </Preview>

      <h3>분 간격 (minuteStep)</h3>
      <Preview>
        <Preview.Demo>
          <StepDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<TimePicker minuteStep={5} placeholder="5분 단위" />`,
            },
          ]}
        />
      </Preview>

      <h3>시간 범위 제한 (min / max)</h3>
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
              code: `<TimePicker
  min={new Date(2020, 0, 1, 9, 0, 0)}
  max={new Date(2020, 0, 1, 18, 0, 0)}
  placeholder="09:00 ~ 18:00"
/>`,
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
              code: `<TimePicker defaultValue={new Date()} />
<TimePicker placeholder="disabled" disabled />
<TimePicker defaultValue={new Date()} readOnly />
<TimePicker placeholder="invalid" aria-invalid />`,
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
              code: `<Label htmlFor="alarm" isRequired>알람 시각</Label>
<TimePicker placeholder="HH:MM" />`,
            },
          ]}
        />
      </Preview>

      <h3>Compound 조립 (Footer 추가)</h3>
      <p className="muted">
        children으로 Trigger/Content/Field/Footer를 조립하면 레이아웃을 자유롭게 커스터마이징할 수 있다.{" "}
        <code>useTimePicker()</code> 훅으로 Footer 내부에서 value/open 상태를 제어한다.
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
              code: `function NowClearActions() {
  const { setValue, setOpen } = useTimePicker();
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => {
        setValue(new Date());
        setOpen(false);
      }}>지금</Button>
      <Button variant="ghost" size="sm" onClick={() => {
        setValue(undefined);
        setOpen(false);
      }}>지우기</Button>
    </>
  );
}

<TimePicker value={time} onValueChange={setTime}>
  <TimePickerTrigger />
  <TimePickerContent>
    <TimePickerField />
    <TimePickerFooter>
      <NowClearActions />
    </TimePickerFooter>
  </TimePickerContent>
</TimePicker>`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "TimePicker", description: "루트. value/open 상태를 Context로 제공. children 생략 시 Trigger + Content + Field 자동 렌더." },
          { name: "TimePickerTrigger", description: "팝오버를 여는 버튼. 기본은 포맷된 시각 + clock 아이콘, children에 render prop 전달 가능." },
          { name: "TimePickerContent", description: "Popover Portal/Positioner/Popup 래퍼." },
          { name: "TimePickerField", description: "세그먼트 스피너 그룹. HH:MM(:SS)(오전/오후). 화살표·숫자·a/p 키 지원." },
          { name: "TimePickerFooter", description: "하단 액션 영역. 지금/지우기 등 버튼 배치." },
          { name: "useTimePicker", description: "Footer 내부에서 value/open을 제어하기 위한 훅." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>TimePicker</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "Date", description: "선택된 시각 (controlled). 시/분/초만 의미 있음 (날짜는 내부적으로 보존됨)." },
          { prop: "defaultValue", type: "Date", description: "초기 시각 (uncontrolled)." },
          { prop: "onValueChange", type: "(date: Date | undefined) => void", description: "시각 변경 콜백." },
          { prop: "hour12", type: "boolean", default: "false (24시간제)", description: "12시간제 + AM/PM 세그먼트 사용 여부. 미지정 시 24시간제. inferHour12(locale)로 locale 기반 추론값을 직접 구해 넘길 수 있음." },
          { prop: "showSeconds", type: "boolean", default: "false", description: "초(SS) 세그먼트 표시." },
          { prop: "minuteStep", type: "number", default: "1", description: "↑/↓ 분 증감 단위." },
          { prop: "secondStep", type: "number", default: "1", description: "↑/↓ 초 증감 단위." },
          { prop: "min", type: "Date", description: "선택 가능 최소 시각(하루 중 시각으로 비교, 날짜 부분 무시)." },
          { prop: "max", type: "Date", description: "선택 가능 최대 시각(하루 중 시각으로 비교, 날짜 부분 무시)." },
          { prop: "placeholder", type: "string", default: "locale 기반 자동", description: "미선택 시 플레이스홀더. 미지정 시 locale 에서 파생 (ko: \"시간 선택\", 그 외: \"Select time\")." },
          { prop: "locale", type: "string", default: `"ko-KR"`, description: "BCP47 로케일. 트리거 포맷과 세그먼트 aria-label 기본값에 적용." },
          { prop: "messages", type: "TimePickerMessages", description: "세그먼트 aria-label override (hours/minutes/seconds/meridiem)." },
          { prop: "formatTime", type: "(date: Date) => string", default: "Intl.DateTimeFormat 기반", description: "트리거에 표시할 시각 포맷 함수." },
          { prop: "disabled", type: "boolean" },
          { prop: "readOnly", type: "boolean" },
          { prop: "aria-invalid", type: `boolean | "true"`, description: "에러 상태. 보더가 --danger로 전환." },
          { prop: "container", type: "HTMLElement | RefObject<HTMLElement | null>", default: "document.body", description: "Portal 마운트 노드." },
          { prop: "children", type: "ReactNode", description: "조립 모드. 생략 시 Trigger + Content + Field가 자동 렌더." },
        ]}
      />

      <h3>키보드 내비게이션</h3>
      <PropsTable
        rows={[
          { prop: "↑↓", type: "", description: "포커스된 세그먼트 증감 (랩어라운드, 분/초는 step 단위)." },
          { prop: "←→", type: "", description: "세그먼트 간 이동." },
          { prop: "0–9", type: "", description: "숫자 직접 입력 (누적, 두 자리 완성 시 자동으로 다음 세그먼트 이동)." },
          { prop: "a / p", type: "", description: "meridiem을 오전/오후로 설정 (hour12일 때만)." },
          { prop: "Backspace", type: "", description: "타이핑 누적 버퍼 초기화." },
          { prop: "Escape", type: "", description: "팝오버 닫기." },
        ]}
      />
    </main>
  );
}
