export const dynamic = "force-static";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";
import { PropsTable } from "@/components/props-table";

const slides = [1, 2, 3, 4, 5];

function SlideTile({
  n,
  height = "10rem",
}: {
  n: number;
  height?: string;
}) {
  return (
    <Card>
      <CardContent>
        <div
          style={{
            display: "grid",
            placeItems: "center",
            height,
            fontSize: "1.5rem",
            fontWeight: 600,
          }}
        >
          {n}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CarouselPage() {
  return (
    <main className="container">
      <h1>Carousel</h1>
      <p className="muted">
        React는 순수 CSS scroll-snap 기반의 compound 컴포넌트. 터치 드래그·키보드
        화살표·자동 재생·도트 인디케이터를 지원한다. Flutter <code>ShUiCarousel</code>
        은 <code>PageView</code> 기반으로 좌우 스와이프와 도트 인디케이터·화살표
        버튼을 제공한다.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ padding: "0 2rem", width: "100%", maxWidth: 420 }}>
            <Carousel>
              <CarouselContent>
                {slides.map((n) => (
                  <CarouselItem key={n}>
                    <SlideTile n={n} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
              <CarouselIndicators />
            </Carousel>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Carousel>
  <CarouselContent>
    {slides.map((n) => (
      <CarouselItem key={n}>
        <Card>
          <CardContent>{n}</CardContent>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselIndicators />
</Carousel>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiCarousel(
  itemHeight: 180,
  items: List.generate(5, (i) => ShUiCard(
    children: [
      ShUiCardContent(
        child: SizedBox(
          height: 100,
          child: Center(child: Text('\${i + 1}', style: TextStyle(fontSize: 32))),
        ),
      ),
    ],
  )),
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
            code: `npx sh-ui-cli add carousel`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add carousel

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_carousel.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/carousel/</code>로 복사한다.{" "}
        외부 의존성 없이 순수 React + CSS로 동작한다.
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
} from "@/components/ui/carousel";

<Carousel>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselIndicators />
</Carousel>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_carousel.dart';

ShUiCarousel(
  itemHeight: 220,
  items: [
    // 임의의 위젯들
    MyFirstSlide(),
    MySecondSlide(),
  ],
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>무한 루프</h3>
      <p className="muted">
        React는 <code>loop</code>만 켜면 다음/이전 버튼이 양 끝에서 감긴다. Flutter
        버전은 현재 무한 루프를 지원하지 않으며 인덱스 기반 스텝으로 동작한다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ padding: "0 2rem", width: "100%", maxWidth: 420 }}>
            <Carousel loop>
              <CarouselContent>
                {slides.map((n) => (
                  <CarouselItem key={n}>
                    <SlideTile n={n} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
              <CarouselIndicators />
            </Carousel>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Carousel loop>...</Carousel>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter 버전은 loop 미지원.
ShUiCarousel(items: slides)`,
            },
          ]}
        />
      </Preview>

      <h3>자동 재생</h3>
      <p className="muted">
        React는 <code>autoPlay</code>로 간단히 켠다. <code>true</code>면 4초
        간격이며, 숫자를 주면 지연(ms)을 지정한다. 마우스가 올라가면 자동으로
        일시정지한다. Flutter는 자동 재생을 기본 제공하지 않지만{" "}
        <code>initialIndex</code>·<code>onIndexChanged</code>를 통해 외부 타이머로
        제어할 수 있다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ padding: "0 2rem", width: "100%", maxWidth: 420 }}>
            <Carousel autoPlay={2500} loop>
              <CarouselContent>
                {slides.map((n) => (
                  <CarouselItem key={n}>
                    <SlideTile n={n} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
              <CarouselIndicators />
            </Carousel>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `{/* 기본 4초 간격 */}
<Carousel autoPlay loop>...</Carousel>

{/* 지연 지정 (ms) */}
<Carousel autoPlay={2500} loop>...</Carousel>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// 자동 재생이 필요하면 상위 위젯에서 Timer로 인덱스를 돌린다.
ShUiCarousel(
  items: slides,
  initialIndex: currentIndex,
  onIndexChanged: (i) => setState(() => currentIndex = i),
)`,
            },
          ]}
        />
      </Preview>

      <h3>인디케이터/컨트롤 숨기기</h3>
      <p className="muted">
        Compound 패턴에서는 구성 요소를 생략하기만 하면 된다. Flutter는{" "}
        <code>showIndicators</code>·<code>showControls</code>로 각각 끌 수 있고,
        좁은 화면(breakpoint.sm 미만)에서는 화살표 버튼이 자동으로 숨겨진다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `{/* React는 구성 요소를 조합해 직접 끈다 */}
<Carousel>
  <CarouselContent>...</CarouselContent>
  {/* CarouselPrevious / CarouselNext / CarouselIndicators 생략 */}
</Carousel>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `ShUiCarousel(
  items: slides,
  showControls: false,   // 화살표 버튼 숨김
  showIndicators: true,  // 도트는 유지
)`,
          },
        ]}
      />

      <h3>세로 방향</h3>
      <p className="muted">
        React는 <code>orientation=&quot;vertical&quot;</code>. Flutter 버전은
        현재 가로 방향만 지원한다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ padding: "2rem 0", width: "100%", maxWidth: 280 }}>
            <Carousel orientation="vertical" loop>
              <CarouselContent>
                {slides.map((n) => (
                  <CarouselItem key={n} style={{ height: "6rem" }}>
                    <SlideTile n={n} height="100%" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Carousel orientation="vertical" loop>
  <CarouselContent>
    <CarouselItem style={{ height: "6rem" }}>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter 버전은 가로만 지원.`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          {
            name: "Carousel",
            description: (
              <>
                React 루트. <code>loop</code>, <code>autoPlay</code>,{" "}
                <code>orientation</code>, <code>index</code>/<code>onIndexChange</code>
                {" "}등을 받고 내부 컨텍스트로 상태를 공유.
              </>
            ),
          },
          {
            name: "CarouselContent",
            description: (
              <>scroll-snap 컨테이너. 슬라이드를 담으며 자체적으로 overflow를 관리한다.</>
            ),
          },
          {
            name: "CarouselItem",
            description: <>개별 슬라이드. 기본 100% 폭, 필요 시 재정의.</>,
          },
          {
            name: "CarouselPrevious",
            description: (
              <>이전 슬라이드로 이동하는 버튼. 끝에 도달하면 disabled (루프 시 항상 활성).</>
            ),
          },
          {
            name: "CarouselNext",
            description: (
              <>다음 슬라이드로 이동하는 버튼. 끝에 도달하면 disabled (루프 시 항상 활성).</>
            ),
          },
          {
            name: "CarouselIndicators",
            description: (
              <>
                도트 인디케이터. 각 도트 클릭으로 해당 슬라이드로 이동.{" "}
                <code>labelFor</code>로 커스텀 aria-label을 지정 가능.
              </>
            ),
          },
          {
            name: "ShUiCarousel",
            description: (
              <>
                Flutter 루트. <code>items</code>·<code>itemHeight</code>·
                <code>showIndicators</code>·<code>showControls</code>·
                <code>initialIndex</code>·<code>onIndexChanged</code>를 받는다.
              </>
            ),
          },
        ]}
      />

      <h2>API Reference (React)</h2>
      <PropsTable
        rows={[
          {
            prop: "orientation",
            type: `"horizontal" | "vertical"`,
            default: `"horizontal"`,
            description: "스크롤 방향.",
          },
          {
            prop: "loop",
            type: "boolean",
            default: "false",
            description: "끝에서 처음으로 이어지는 무한 루프.",
          },
          {
            prop: "autoPlay",
            type: "boolean | number",
            default: "false",
            description:
              "자동 재생. true=4000ms, 숫자=지연(ms). 마우스 오버 시 자동 일시정지.",
          },
          {
            prop: "defaultIndex",
            type: "number",
            default: "0",
            description: "초기 슬라이드 인덱스 (비제어 모드).",
          },
          {
            prop: "index",
            type: "number",
            default: "-",
            description: "제어 모드 인덱스. onIndexChange와 함께 사용.",
          },
          {
            prop: "onIndexChange",
            type: "(index: number) => void",
            default: "-",
            description: "인덱스 변경 콜백.",
          },
        ]}
      />

      <h2>API Reference (Flutter)</h2>
      <PropsTable
        rows={[
          {
            prop: "items",
            type: "List<Widget>",
            default: "-",
            description: "슬라이드로 표시할 위젯 목록.",
          },
          {
            prop: "itemHeight",
            type: "double?",
            default: "220",
            description: "슬라이드 영역 높이.",
          },
          {
            prop: "showIndicators",
            type: "bool",
            default: "true",
            description: "하단 도트 인디케이터 노출 여부.",
          },
          {
            prop: "showControls",
            type: "bool",
            default: "true",
            description:
              "좌/우 화살표 버튼 노출 여부. 좁은 폭(breakpoint.sm 미만)에서는 자동 숨김.",
          },
          {
            prop: "initialIndex",
            type: "int?",
            default: "0",
            description: "초기 선택 인덱스.",
          },
          {
            prop: "onIndexChanged",
            type: "ValueChanged<int>?",
            default: "-",
            description: "인덱스 변경 콜백.",
          },
        ]}
      />
    </main>
  );
}
