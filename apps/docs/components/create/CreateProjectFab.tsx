"use client";

type Props = {
  onClick: () => void;
};

export function CreateProjectFab({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="프로젝트 만들기"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.625rem 1rem",
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
