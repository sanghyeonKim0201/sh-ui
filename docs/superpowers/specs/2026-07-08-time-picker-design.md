# TimePicker 컴포넌트 설계

- 날짜: 2026-07-08
- 대상 레포: sh-ui (React + Flutter 디자인 시스템)
- 상태: 승인됨 (구현 대기)

## 배경 / 목적

sh-ui에는 `date-picker`·`calendar`·`numeric-input`·`combobox`·`select`는 있으나
**시각 입력 전용 컴포넌트가 없다.** date-picker도 시간 선택을 포함하지 않는다.
라이브러리 완성도를 위해 `time-picker`를 신설한다.

기존 `date-picker`가 잘 정립된 관례(Base UI 위 compound 구조, controlled/uncontrolled,
locale, min/max, disabled/readOnly, aria-invalid, container, compound 서브컴포넌트 +
훅, React↔Flutter 듀얼 카피, docs 듀얼 플랫폼)를 갖고 있으므로 이를 **미러링**한다.

## 확정된 결정 (브레인스토밍 결과)

1. **입력 방식**: 트리거 버튼 + 팝오버. 팝오버 안은 **세그먼트 스피너**(스크롤 리스트 아님).
   date-picker와 시각적으로 통일.
2. **정밀도/포맷**: 24시간제 `HH:MM` 기본 + 12시간제(AM/PM) + 초(SS) + minuteStep/min/max — **풀 스펙**.
3. **value 타입**: `Date` (date-picker와 동일).
4. **플랫폼**: React + Flutter **둘 다 한 번에** (docs + showcase 포함).

## 상세 설계

### 1. 값 모델 (value)

- `value?: Date` / `defaultValue?: Date` / `onValueChange?: (date: Date | undefined) => void`
  — date-picker와 동일한 controlled/uncontrolled 패턴.
- **시각(시·분·초)만 의미**를 가진다. 값 갱신 시:
  - 기존 `value`가 있으면 그 **날짜를 보존**한 채 시/분/초만 바꾼 새 Date 반환.
  - 없으면 **오늘 날짜** 기준으로 생성.
  - 이 동작을 문서(JSDoc)에 명시한다.
- `min?: Date` / `max?: Date` — **하루 중 시각(자정 기준 초 offset = h*3600 + m*60 + s)으로만
  비교**한다. 날짜 부분은 무시. 범위 밖 값은 세그먼트 증감 시 클램프(범위 경계에서 멈춤).

### 2. 포맷·정밀도 props

- `hour12?: boolean` — 미지정 시 **locale에서 자동 추론**(`Intl.DateTimeFormat(locale).resolvedOptions().hour12`
  또는 동등 판정), 명시하면 override. AM/PM(오전/오후) 세그먼트 유무를 결정.
- `showSeconds?: boolean` (기본 `false`) — `HH:MM` ↔ `HH:MM:SS`.
- `minuteStep?: number` (기본 `1`) — ↑/↓ 증감 단위. 타이핑 입력값은 커밋 시 스텝에 스냅.
- `secondStep?: number` (기본 `1`) — 초 세그먼트 증감 단위. showSeconds일 때만 유효.
- `formatTime?: (date: Date) => string` — 트리거 표시 포맷터.
  기본값: `Intl.DateTimeFormat(locale, { hour, minute, second?, hour12 })` 기반.
- 공통 props: `placeholder`, `locale`(기본 `ko-KR`), `disabled`, `readOnly`,
  `aria-invalid`, `className`, `container`.

### 3. 인터랙션 — 세그먼트 스피너 (팝오버 안)

- **트리거 버튼**: 포맷된 시각 + **시계 아이콘**(date-picker의 CalendarIcon 스타일에 맞춘 ClockIcon)
  → 클릭 시 팝오버. `disabled`/`readOnly`는 date-picker와 동일 처리(readOnly는 팝오버 안 열림,
  disabled는 클릭·키보드 차단).
- **팝오버 본문**: `[HH] : [MM] ( : [SS] ) [오전/오후]` 세그먼트.
  각 세그먼트는 `role="spinbutton"` (`aria-valuenow` / `aria-valuemin` / `aria-valuemax` / `aria-valuetext` / `aria-label`).
  - **↑/↓**: 포커스된 세그먼트 증감(랩어라운드; 시는 0–23 또는 1–12, 분/초는 step 단위, meridiem 토글).
  - **←/→**: 세그먼트 간 포커스 이동.
  - **숫자 타이핑**: 누적 입력(예: "1"→"3" = 13). 자리가 채워지거나 더 입력해도 유효하지 않으면
    다음 세그먼트로 **auto-advance**. 유효 범위 초과 입력은 무시하거나 마지막 유효값으로 처리.
  - **Backspace**: 세그먼트 값 지움(빈 상태).
  - **a / p 키**: meridiem을 AM / PM으로 설정.
  - 값은 편집 중 **라이브 커밋**(각 세그먼트 확정 시 onValueChange). 팝오버는 **외부 클릭·Enter·Escape**로 닫힘.
- **meridiem 세그먼트는 항상 끝(오른쪽)에 배치**, 라벨만 locale화(오전/오후 · AM/PM).
  locale별 세그먼트 순서 재배치는 **YAGNI로 제외**.

### 4. Compound 구조 (date-picker 미러링)

- `TimePicker` — root. `children` 생략 시 기본 레이아웃(Trigger + Content + Field) 자동 렌더.
- `TimePickerTrigger` — 팝오버 여는 버튼. `<button>` 직접 렌더(중첩 금지). children 함수로 표시 텍스트 커스터마이즈 가능.
- `TimePickerContent` — 팝오버 본문. portal 마운트, `disabled`/`readOnly`면 렌더 안 됨. `side`/`align`/`sideOffset`/`container`.
- `TimePickerField` — 세그먼트 에디터 본체(스피너 그룹).
- `TimePickerFooter` — 하단 액션 슬롯("지금"·"지우기" 같은 커스텀 버튼 배치용).
- `useTimePicker()` — 커스텀 footer 액션에서 value/open 상태 접근. TimePicker 내부에서만.

### 5. 아이콘 / 스타일

- `ClockIcon` — 16 viewBox, `stroke="currentColor"`, CalendarIcon과 동일한 시각 무게.
- 클래스 네이밍은 date-picker 패턴을 따른다:
  `sh-ui-time-picker__trigger` / `__value` / `__placeholder` / `__icon` / `__positioner` /
  `__popup` / `__field` / `__segment` / `__segment--focused` / `__separator` / `__footer`.
- 스타일 변형은 date-picker와 동일하게 3종:
  `styles.css`(vanilla) + `styles.module.css` + `index.tsx`/`index.module.tsx`/`index.tailwind.tsx`.
- 모든 치수는 토큰 변수(`var(--space-*)` 등) 경유. 매직 px/rem 금지(레포 오버라이드 2번 준수).

### 6. 파일 표면 (레포 관례 준수)

**React 원본**
- `packages/registry/react/components/time-picker/index.tsx`
- `packages/registry/react/components/time-picker/index.module.tsx`
- `packages/registry/react/components/time-picker/index.tailwind.tsx`
- `packages/registry/react/components/time-picker/styles.css`
- `packages/registry/react/components/time-picker/styles.module.css`

**docs 복사본 (듀얼 카피 — 원본과 항상 동기화)**
- `apps/docs/components/ui/time-picker/` (위 파일 미러)

**Flutter 원본/복사본 (듀얼 카피)**
- `packages/registry/flutter/widgets/sh_ui_time_picker.dart`
- `apps/showcase/lib/widgets/sh_ui_time_picker.dart`
- 세그먼트 스테퍼로 React와 API·인터랙션 통일(value: `DateTime`, onChanged, hour12, showSeconds,
  minuteStep, min/max, disabled/readOnly).

**docs 페이지 (듀얼 플랫폼)**
- `apps/docs/app/[locale]/(docs)/components/time-picker/page.tsx` — `<CodeTabs>` React + Flutter 양 탭.

**등록 접점**
- `packages/registry/react/registry.json` — 컴포넌트 엔트리 + tokens-used
- `packages/registry/react/tokens-used.json` — 사용 토큰 등록
- `packages/registry/flutter/registry.json` — Flutter 위젯 엔트리
- `apps/docs/components/app-sidebar.tsx` — nav 등록(적절한 그룹)
- `apps/docs/app/[locale]/(docs)/components/page.tsx` — 컴포넌트 색인 카드
- `apps/docs/components/create/showcases/time-picker.tsx` + `.../showcases/index.ts` — 라이브 showcase
- 검색 인덱스 — dev watch가 자동 재생성(`apps/docs/public/search-index.json`); 필요 시 재빌드
- `apps/docs/tests/visual/components.spec.ts` — visual baseline 추가
- showcase Flutter 페이지 등록(showcase 앱 nav)

**변경 내역**
- 신규 컴포넌트 = **MINOR** 범프 → `packages/changelog/versions.json`에 엔트리 **prepend**.
- 릴리즈는 dev → live PR → live에서 태그(레포 브랜치 정책 준수).

### 7. 테스트 계획

- **단위 테스트**:
  - 세그먼트 키보드 로직 — ↑/↓ 증감·랩어라운드, 숫자 타이핑 누적, auto-advance, Backspace, a/p meridiem.
  - value ↔ 세그먼트 변환(Date에서 시/분/초 추출, 세그먼트 → 새 Date, 날짜 부분 보존).
  - min/max 클램프, minuteStep/secondStep 스냅.
  - hour12 locale 추론.
  - controlled/uncontrolled, disabled/readOnly, aria-invalid.
- **시각 테스트**: docs visual baseline 추가(`components.spec.ts`).
- **타입 체크**: `pnpm tsc --noEmit` 통과.

## 비목표 (YAGNI 제외)

- 팝오버 안 스크롤 휠/리스트 방식(세그먼트 스피너로 확정).
- locale별 세그먼트 순서 동적 재배치(meridiem은 항상 끝).
- date + time 통합 컴포넌트(향후 별도 스코프. 단 value=Date라 조합은 용이).
- 타임존 처리(로컬 시각만 다룸).

## 열린 항목 (구현 중 확정)

- 현재 버전 확인 후 versions.json MINOR 버전 번호 결정.
- Flutter 세그먼트 스테퍼의 정확한 위젯 구성(showcase 관례에 맞춰 구현 시 확정).
- 검색 인덱스가 watch로 자동인지, 수동 재빌드가 필요한지 실제 확인.
