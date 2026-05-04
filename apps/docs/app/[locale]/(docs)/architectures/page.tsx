export const dynamic = "force-static";

import Link from "next/link";
import { allArchitectures, getArchesForPlatform } from "sh-ui-cli/api";

import { CodePanel } from "@/components/ui/code-panel";

const NEXT_ARCHES = getArchesForPlatform("next");
const ARCH_NAMES = NEXT_ARCHES.map((a) => a.name).join("|");

export default function ArchitecturesHub() {
  return (
    <main className="container">
      <h1>아키텍처</h1>
      <p className="muted">
        sh-ui 가 스캐폴드하는 프로젝트의 <em>모양</em> — 폴더 구조, import alias
        컨벤션, tsconfig <code>paths</code> 블록을 한 묶음으로 정의하는 1급
        개념. <code>--arch</code> 인자로 한 개를 선택한다.
      </p>

      <h2>arch 와 플러그인은 별개</h2>
      <p>
        <strong>arch</strong> 는 프로젝트 모양 (한 개 선택, 상호배타적),
        <strong>플러그인</strong> 은 기능 (여러 개 조합 가능). 두 축은 직교한다.
      </p>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`# arch 와 플러그인을 함께 지정
npx sh-ui-cli create my-app \\
  --platform next --structure standalone \\
  --arch flat \\
  --plugins sentry,next-intl,auth-jwt \\
  --yes

# arch 미지정 시 기본 fsd
npx sh-ui-cli create my-app --platform next --structure standalone --yes`}
      />

      <h2>현재 아키텍처</h2>
      <ul>
        {allArchitectures.map((a) => (
          <li key={a.name}>
            <Link href={`/architectures/${a.name}`}>
              <strong>{a.name}</strong>
            </Link>
            {" — "}
            {a.description}
          </li>
        ))}
      </ul>

      <h2>비교</h2>
      <table>
        <thead>
          <tr>
            <th>논리 키</th>
            {NEXT_ARCHES.map((a) => (
              <th key={a.name}>{a.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(["layouts", "providers", "api", "config", "hooks", "utils", "ui", "test"] as const).map((key) => (
            <tr key={key}>
              <td>
                <code>{key}</code>
              </td>
              {NEXT_ARCHES.map((a) => (
                <td key={a.name}>
                  <code>{a.paths[key]}</code>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>어떤 걸 골라야 하나</h2>
      <ul>
        <li>
          <strong>FSD</strong> — 도메인이 크거나 여러 사람이 동시에 손대는
          프로젝트. 슬라이스 (entities/features/widgets/views) 가 책임 경계를
          명확히 잡아주고, 코드 양이 늘어나도 폴더가 발산하지 않음. 한국 React
          생태계에서 표준 비슷하게 자리잡고 있어 신규 합류자 학습 비용 낮음.
        </li>
        <li>
          <strong>Flat</strong> — 토이 프로젝트, 데모, 일회성 도구, 또는 1~2명이
          짧게 만드는 앱. <code>app/</code> + <code>components/</code> +{" "}
          <code>lib/</code> 만 있는 vanilla Next.js 관용에 가까워 진입 장벽 낮음.
          import 가 짧음 (<code>@/lib/api/x</code> 처럼 카테고리 박힘).
        </li>
      </ul>
      <p>
        커지면서 FSD 로 옮기고 싶어지면 폴더 이동 + alias 치환만으로 마이그레이션
        가능 — sh-ui 가 강제하는 구조가 아니라 시작점만 제공한다.
      </p>

      <h2>새 arch 추가하기</h2>
      <p>
        Clean Architecture, MVC, Atomic 등 자기 컨벤션이 있다면 디스크립터를
        직접 추가할 수 있다. 컨트리뷰터 가이드는{" "}
        <code>packages/cli/ARCHITECTURE.md</code> (CLI 패키지 안) 참고.
      </p>

      <h2>지원 매트릭스</h2>
      <p>
        현재 <code>--arch</code> 가 받는 값: <code>{ARCH_NAMES}</code>.
        Flutter 플랫폼은 아직 arch 디스크립터가 없다 — 향후 v0.59+ 에서
        flutter-default 등 추가 예정.
      </p>
    </main>
  );
}
