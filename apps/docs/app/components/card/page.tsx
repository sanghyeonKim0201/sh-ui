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
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";

export default function CardPage() {
  return (
    <main className="container">
      <h1>Card</h1>
      <p className="muted">
        컨텐츠를 그룹화하는 컨테이너. 컴파운드 컴포넌트 패턴으로 조합한다.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>이메일과 푸시 알림을 받을지 선택하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>현재 모든 알림이 꺼져 있습니다. 언제든 다시 켤 수 있습니다.</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary">나중에</Button>
                <Button>설정하기</Button>
              </CardFooter>
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
    <CardTitle>알림 설정</CardTitle>
    <CardDescription>이메일과 푸시 알림을 받을지 선택하세요.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>현재 모든 알림이 꺼져 있습니다. 언제든 다시 켤 수 있습니다.</p>
  </CardContent>
  <CardFooter>
    <Button variant="secondary">나중에</Button>
    <Button>설정하기</Button>
  </CardFooter>
</Card>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiCard(
  children: [
    const ShUiCardHeader(
      title: ShUiCardTitle('알림 설정'),
      description: ShUiCardDescription('이메일과 푸시 알림을 받을지 선택하세요.'),
    ),
    const ShUiCardContent(
      child: Text('현재 모든 알림이 꺼져 있습니다. 언제든 다시 켤 수 있습니다.'),
    ),
    ShUiCardFooter(
      children: [
        ShUiButton(
          variant: ShUiButtonVariant.secondary,
          onPressed: () {},
          child: const Text('나중에'),
        ),
        ShUiButton(
          onPressed: () {},
          child: const Text('설정하기'),
        ),
      ],
    ),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui add card`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui add card

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_card.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/card/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

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
