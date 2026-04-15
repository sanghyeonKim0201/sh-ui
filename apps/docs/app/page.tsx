import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container">
      <h1>Hyeon Design System</h1>
      <p className="muted">
        <strong>玄</strong> — 검고 그윽하다. 블랙 &amp; 화이트를 기본으로, 설정대로 벼려져 내려받는 멀티 플랫폼 디자인 시스템.
      </p>

      <div style={{ display: "flex", gap: "0.75rem", margin: "1.5rem 0 2rem" }}>
        <Link href="/getting-started" style={{ textDecoration: "none" }}>
          <Button size="lg">시작하기</Button>
        </Link>
        <Link href="/components/button" style={{ textDecoration: "none" }}>
          <Button variant="secondary" size="lg">컴포넌트 보기</Button>
        </Link>
      </div>

      <h2>철학</h2>
      <ul>
        <li><strong>코드 소유권은 사용자에게</strong> — 패키지로 묶지 않고 소스를 프로젝트로 복사한다 (shadcn 방식).</li>
        <li><strong>하나의 토큰, 여러 플랫폼</strong> — 같은 semantic 토큰에서 React의 CSS 변수와 Flutter의 Dart 상수를 동시에 생성.</li>
        <li><strong>설정으로 변환</strong> — <code>hyeon.config.json</code>의 테마/radius가 복사 시점에 토큰 값으로 치환된다.</li>
      </ul>

      <h2>지원 플랫폼</h2>
      <ul>
        <li>React (Next.js) — 현재</li>
        <li>Flutter — 현재</li>
        <li>추가 예정</li>
      </ul>
    </main>
  );
}
