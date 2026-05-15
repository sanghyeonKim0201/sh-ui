export const dynamic = "force-static";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeTabs } from "@/components/ui/code-tabs";
import { VariantSource } from "@/components/variant-source";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";
import {
  loadComponentSources,
  loadExtraComponent,
} from "@/components/sandbox-code/load-component-sources";
import { CardLiveDemo } from "./card-live-demo";

const sources = loadComponentSources("card");
const extras = [loadExtraComponent("button")];

export default function CardPage() {
  return (
    <main className="container">
      <h1>Card</h1>
      <p className="muted">
        컨텐츠를 그룹화하는 컨테이너. 컴파운드 컴포넌트 패턴으로 조합한다.
      </p>

      <CardLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
        extraComponents={extras}
      />

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add card`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add card

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_card.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="card" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import {
  Card, CardHeader, CardTitle, CardDescription,
  CardAction, CardContent, CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>본문</CardContent>
  <CardFooter>
    <Button>확인</Button>
  </CardFooter>
</Card>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_card.dart';
import '../widgets/sh_ui_button.dart';

ShUiCard(
  children: [
    const ShUiCardHeader(
      title: ShUiCardTitle('제목'),
      description: ShUiCardDescription('설명'),
    ),
    const ShUiCardContent(child: Text('본문')),
    ShUiCardFooter(
      children: [
        ShUiButton(
          onPressed: () {},
          child: const Text('확인'),
        ),
      ],
    ),
  ],
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>액션 포함 헤더</h3>
      <p className="muted">
        <code>CardAction</code>이 헤더 우측 슬롯에 배치된다. CSS <code>:has()</code>로 자동 감지해 2열 그리드로 전환.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 A</CardTitle>
                <CardDescription>마지막 업데이트: 3일 전</CardDescription>
                <CardAction>
                  <Button variant="link">자세히</Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p>현재 3개의 작업이 진행 중입니다.</p>
              </CardContent>
            </Card>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Card>
  <CardHeader>
    <CardTitle>프로젝트 A</CardTitle>
    <CardDescription>마지막 업데이트: 3일 전</CardDescription>
    <CardAction>
      <Button variant="link">자세히</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>현재 3개의 작업이 진행 중입니다.</p>
  </CardContent>
</Card>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// ShUiCardHeader는 action 슬롯을 named parameter로 받는다.
ShUiCard(
  children: [
    ShUiCardHeader(
      title: const ShUiCardTitle('프로젝트 A'),
      description: const ShUiCardDescription('마지막 업데이트: 3일 전'),
      action: ShUiButton(
        variant: ShUiButtonVariant.link,
        onPressed: () {},
        child: const Text('자세히'),
      ),
    ),
    const ShUiCardContent(
      child: Text('현재 3개의 작업이 진행 중입니다.'),
    ),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>콘텐츠만</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <Card>
              <CardContent>
                <p>헤더/푸터 없이 본문만 있는 카드. 통계나 안내 박스 용도.</p>
              </CardContent>
            </Card>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Card>
  <CardContent>
    <p>헤더/푸터 없이 본문만 있는 카드.</p>
  </CardContent>
</Card>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiCard(
  children: [
    ShUiCardContent(
      child: Text('헤더/푸터 없이 본문만 있는 카드.'),
    ),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>로딩 상태 (Skeleton placeholder)</h3>
      <p className="muted">
        Card 자체에는 로딩 prop 이 없다. 데이터가 도착하기 전에는 같은 자리·같은 크기의{" "}
        <code>Skeleton</code> 으로 본문을 채워 레이아웃 점프를 막는다. Card 에는{" "}
        <code>aria-busy</code> 를 두어 스크린리더에 진행 중임을 알린다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function UserCard({ userId }: { userId: string }) {
  const { data, isLoading } = useUser(userId);

  return (
    <Card aria-busy={isLoading || undefined}>
      <CardHeader>
        <CardTitle>
          {isLoading ? (
            <Skeleton style={{ height: "1.25rem", width: "8rem" }} />
          ) : (
            data.name
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <Skeleton style={{ height: "1rem" }} />
            <Skeleton style={{ height: "1rem", width: "85%" }} />
            <Skeleton style={{ height: "1rem", width: "60%" }} />
          </div>
        ) : (
          <p>{data.bio}</p>
        )}
      </CardContent>
    </Card>
  );
}`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_card.dart';
import '../widgets/sh_ui_skeleton.dart';

class UserCard extends StatelessWidget {
  final bool isLoading;
  final User? data;
  const UserCard({super.key, required this.isLoading, this.data});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      // 스크린리더에 진행 중임을 알림
      liveRegion: isLoading,
      child: ShUiCard(
        children: [
          ShUiCardHeader(
            children: [
              isLoading
                  ? const ShUiSkeleton(width: 128, height: 20)
                  : ShUiCardTitle(child: Text(data!.name)),
            ],
          ),
          ShUiCardContent(
            child: isLoading
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: const [
                      ShUiSkeleton(height: 16),
                      SizedBox(height: 8),
                      ShUiSkeleton(height: 16, width: 240),
                      SizedBox(height: 8),
                      ShUiSkeleton(height: 16, width: 160),
                    ],
                  )
                : Text(data!.bio),
          ),
        ],
      ),
    );
  }
}`,
          },
        ]}
      />
      <p className="muted" style={{ marginTop: "var(--space-3)" }}>
        팁 — Skeleton 의 너비는 실제 텍스트가 차지할 너비에 가깝게 잡는다 (제목은 짧게, 본문은 가득).
        그래야 데이터가 도착했을 때 시각적 점프가 거의 없다.
      </p>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Card", description: <>외곽 컨테이너 (border, radius, padding).</> },
          { name: "CardHeader", description: <><code>CardAction</code> 유무에 따라 1열/2열 그리드 자동 전환.</> },
          { name: "CardTitle", description: "제목 (16px, semibold)." },
          { name: "CardDescription", description: "부제 (14px, muted)." },
          { name: "CardAction", description: "헤더 우측 액션 슬롯 (버튼/링크 등)." },
          { name: "CardContent", description: "본문 영역." },
          { name: "CardFooter", description: "하단 액션 영역 (기본 flex row)." },
        ]}
      />

      <h2>API Reference</h2>
      <p className="muted">
        각 구성 컴포넌트는 자신의 네이티브 HTML 속성을 그대로 받는다. 별도 prop은
        없다. 간격·패딩·레이아웃 조정은 <code>style</code> / <code>className</code> 으로
        직접 — 자세한 패턴은 <a href="/guidelines">가이드라인</a> 의 "스타일
        커스터마이즈" 섹션 참조.
      </p>
    </main>
  );
}
