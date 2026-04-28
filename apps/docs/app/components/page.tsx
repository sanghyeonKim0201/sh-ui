export const dynamic = "force-static";

import Link from "next/link";

type Item = { name: string; slug: string; description: string };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  {
    title: "Forms & Inputs",
    items: [
      { name: "Button", slug: "button", description: "기본 버튼 — variant·size 지원." },
      { name: "Input", slug: "input", description: "단일 행 텍스트 입력 — hasError 지원." },
      { name: "Textarea", slug: "textarea", description: "여러 행 텍스트 입력 — autoResize." },
      { name: "Label", slug: "label", description: "폼 레이블 — htmlFor 로 입력과 연결." },
      { name: "Select", slug: "select", description: "네이티브 대체 셀렉트 (Base UI)." },
      { name: "Combobox", slug: "combobox", description: "검색 가능 셀렉트, 키보드 내비." },
      { name: "Checkbox", slug: "checkbox", description: "indeterminate 지원." },
      { name: "Radio", slug: "radio", description: "RadioGroup + RadioGroupItem." },
      { name: "Switch", slug: "switch", description: "토글 스위치 — controlled/uncontrolled." },
      { name: "Toggle", slug: "toggle", description: "단일 토글 / 토글 그룹." },
      { name: "Slider", slug: "slider", description: "수평 슬라이더 — 단일/범위 값." },
      { name: "ColorPicker", slug: "color-picker", description: "색상 선택 — hex/rgb, 프리셋." },
      { name: "DatePicker", slug: "date-picker", description: "날짜 선택 — 캘린더 팝업." },
      { name: "FileUpload", slug: "file-upload", description: "드롭존 · 다중 파일 · 진행률." },
      { name: "Form", slug: "form", description: "폼 어댑터 — yup/RHF/TanStack Form." },
    ],
  },
  {
    title: "Editors",
    items: [
      { name: "CodeEditor", slug: "code-editor", description: "CodeMirror 6 기반 controlled 코드 에디터." },
      { name: "MarkdownEditor", slug: "markdown-editor", description: "CodeEditor + react-markdown 라이브 프리뷰." },
      { name: "RichTextEditor", slug: "rich-text-editor", description: "Tiptap 3 기반 WYSIWYG + toolbar." },
    ],
  },
  {
    title: "Layout & Navigation",
    items: [
      { name: "Header", slug: "header", description: "상단 네비 — 데스크탑 inline / 모바일 drawer 자동 전환." },
      { name: "Sidebar", slug: "sidebar", description: "좌측 사이드바 — collapsible · drawer." },
      { name: "Tabs", slug: "tabs", description: "탭 인터페이스 — controlled / uncontrolled." },
      { name: "Accordion", slug: "accordion", description: "펼침/접힘 패널." },
      { name: "Breadcrumb", slug: "breadcrumb", description: "현재 페이지의 계층 위치." },
      { name: "Pagination", slug: "pagination", description: "페이지 네비게이션." },
      { name: "Menubar", slug: "menubar", description: "수평 메뉴바 — dropdown sub-menu." },
      { name: "DropdownMenu", slug: "dropdown-menu", description: "드롭다운 메뉴 — sub-menu 지원." },
      { name: "ContextMenu", slug: "context-menu", description: "우클릭 컨텍스트 메뉴." },
      { name: "Card", slug: "card", description: "카드 컨테이너 — Header/Body/Footer." },
      { name: "Separator", slug: "separator", description: "수평/수직 구분선." },
    ],
  },
  {
    title: "Feedback & Overlay",
    items: [
      { name: "Dialog", slug: "dialog", description: "모달 다이얼로그 — 포커스 트랩." },
      { name: "Popover", slug: "popover", description: "트리거 기준 위치 floating." },
      { name: "Tooltip", slug: "tooltip", description: "짧은 힌트 — hover/focus." },
      { name: "Toast", slug: "toast", description: "임시 알림 — useToast 훅." },
      { name: "Progress", slug: "progress", description: "진행률 표시." },
      { name: "Spinner", slug: "spinner", description: "로딩 스피너." },
      { name: "Skeleton", slug: "skeleton", description: "스켈레톤 로딩 플레이스홀더." },
      { name: "Badge", slug: "badge", description: "라벨/배지." },
    ],
  },
  {
    title: "Display",
    items: [
      { name: "Avatar", slug: "avatar", description: "프로필 이미지 — 폴백 이니셜." },
      { name: "Carousel", slug: "carousel", description: "슬라이드 캐러셀 — Embla 기반." },
      { name: "CodePanel", slug: "code-panel", description: "Shiki 기반 코드 하이라이트 패널." },
    ],
  },
  {
    title: "Theme",
    items: [
      { name: "Theme", slug: "theme", description: "테마 프로바이더 + useTheme — light/dark/system." },
    ],
  },
];

export default function ComponentsIndexPage() {
  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <main className="container">
      <h1>Components</h1>
      <p className="muted">
        sh-ui 가 제공하는 React 컴포넌트 {total} 종 — 모두 Base UI 위에 구축됐고, 디자인 토큰을 통해 사이트 전반의 라이트/다크 테마를 자동 추종한다.
      </p>

      <div style={{ display: "grid", gap: "var(--space-7)", marginTop: "var(--space-5)" }}>
        {groups.map((group) => (
          <section key={group.title}>
            <h2 style={{ marginBottom: "var(--space-4)" }}>{group.title}</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "var(--space-3)",
              }}
            >
              {group.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/components/${item.slug}`}
                  style={{
                    display: "block",
                    padding: "var(--space-4)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    background: "var(--background)",
                    textDecoration: "none",
                    color: "var(--foreground)",
                    transition:
                      "border-color var(--duration-fast), background-color var(--duration-fast), transform var(--duration-fast)",
                  }}
                  className="sh-ui-component-card"
                >
                  <div style={{ fontWeight: 600, fontSize: "var(--text-base)", marginBottom: "0.25rem" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--foreground-muted)", lineHeight: 1.5 }}>
                    {item.description}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
