"use client";

type Props = {
  onClick: () => void;
};

/**
 * 접근성 노트:
 * - 시각적 텍스트 "프로젝트 만들기" 가 이미 accessible name 이므로 aria-label 중복 제거.
 * - focus-visible 에서 포커스 링 명시 (기본 outline 사라지지 않게).
 * - 44×44px 최소 터치 타겟 (WCAG 2.5.5) — min-height 44px 설정.
 */
export function CreateProjectFab({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="sh-ui-create-fab"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1.125rem",
        minHeight: "44px",
        background: "var(--primary)",
        color: "var(--primary-foreground)",
        border: "none",
        borderRadius: "999px",
        fontSize: "0.8125rem",
        fontWeight: 500,
        cursor: "pointer",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <span aria-hidden>＋</span>
      <span>프로젝트 만들기</span>
    </button>
  );
}
