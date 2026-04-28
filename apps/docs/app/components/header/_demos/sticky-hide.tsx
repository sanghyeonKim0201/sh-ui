"use client";

import {
  Header,
  HeaderActions,
  HeaderBrand,
  HeaderItem,
  HeaderNav,
  HeaderTitle,
  HeaderTrigger,
} from "@/components/ui/header";
import { Button } from "@/components/ui/button";

export function StickyHideDemo() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "320px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflowY: "auto",
        background: "var(--background)",
      }}
      aria-label="스크롤 시뮬레이션 컨테이너"
    >
      <Header
        variant="blur"
        stickyHide
        stickyHideThreshold={40}
        style={{ position: "sticky", top: 0, zIndex: 5 }}
      >
        <HeaderTrigger />
        <HeaderBrand>
          <HeaderTitle>Acme</HeaderTitle>
        </HeaderBrand>
        <HeaderNav>
          <HeaderItem href="#" active>
            홈
          </HeaderItem>
          <HeaderItem href="#">제품</HeaderItem>
          <HeaderItem href="#">문서</HeaderItem>
        </HeaderNav>
        <HeaderActions>
          <Button variant="secondary" size="sm">
            로그인
          </Button>
        </HeaderActions>
      </Header>
      <div style={{ padding: "var(--space-4)", color: "var(--foreground-muted)" }}>
        <p style={{ marginTop: 0 }}>
          이 컨테이너 안에서 <strong>아래로 스크롤하면 헤더가 사라지고</strong>, 위로 스크롤하면 다시 나타납니다.
        </p>
        {Array.from({ length: 12 }).map((_, i) => (
          <p key={i}>
            샘플 본문 {i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </div>
  );
}
