export const dynamic = "force-static";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
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
        React는 Embla 기반. 터치 드래그·키보드 화살표·무한 루프·자동 재생을
        지원한다. Flutter <code>ShUiCarousel</code>은 <code>PageView</code>{" "}
        기반으로 좌우 스와이프와 도트 인디케이터·화살표 버튼을 제공한다.
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
            code: `npx sh-ui add carousel`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui add carousel

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_carousel.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/carousel/</code>로 복사한다.{" "}
        <code>embla-carousel</code>, <code>embla-carousel-react</code>,{" "}
        <code>embla-carousel-autoplay</code>,{" "}
        <code>embla-carousel-auto-scroll</code> 의존성이 필요하다.
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
} from "@/components/ui/carousel";

<Carousel>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
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
        React는 <code>loop</code>만 켜면 무한 루프. Flutter 버전은 현재 무한 루프를
        지원하지 않으며 인덱스 기반 스텝으로 동작한다.
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
        React는 <code>autoPlay</code>로 간단히 켠다. Flutter는 자동 재생을
        기본 제공하지 않지만 <code>initialIndex</code>·<code>onIndexChanged</code>를
        통해 외부 타이머로 <code>ShUiCarousel</code>을 제어할 수 있다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ padding: "0 2rem", width: "100%", maxWidth: 420 }}>
            <Carousel autoPlay={2500}>
              <CarouselContent>
                {slides.map((n) => (
                  <CarouselItem key={n}>
                    <SlideTile n={n} />
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
              code: `{/* 기본 4초 간격 */}
<Carousel autoPlay>...</Carousel>

{/* 지연 지정 (ms) */}
<Carousel autoPlay={2500}>...</Carousel>

{/* 객체로 세부 옵션 지정 */}
<Carousel autoPlay={{ delay: 3000, stopOnInteraction: true }}>
  ...
</Carousel>`,
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

      <h3>자동 스크롤 (연속 모드)</h3>
      <p className="muted">
        <code>autoScroll</code>은 한 장씩 끊어 넘기는 대신 일정 속도로 흐르듯
        움직인다. 로고 월이나 티커처럼 끊김 없는 흐름이 필요할 때 쓴다. 숫자를
        주면 <code>speed</code>(프레임당 픽셀)를 지정하며, 보통{" "}
        <code>loop</code>과 같이 켠다. Flutter 버전은 지원하지 않는다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ padding: "0 2rem", width: "100%" }}>
            <Carousel loop autoScroll>
              <CarouselContent>
                {slides.map((n) => (
                  <CarouselItem
                    key={n}
                    style={{ flex: "0 0 calc(25% - 0.75rem)" }}
                  >
                    <SlideTile n={n} height="5rem" />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `{/* 기본 속도 */}
<Carousel loop autoScroll>...</Carousel>

{/* 속도 지정 (px/frame) */}
<Carousel loop autoScroll={2}>...</Carousel>

{/* 역방향 + 마우스 오버 시 멈춤 끄기 */}
<Carousel
  loop
  autoScroll={{ direction: "backward", stopOnMouseEnter: false }}
>
  ...
</Carousel>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter 버전은 autoScroll 미지원.`,
            },
          ]}
        />
      </Preview>

      <h3>인디케이터/컨트롤 숨기기</h3>
      <p className="muted">
        Flutter는 <code>showIndicators</code>·<code>showControls</code>로 도트와
        화살표 버튼을 각각 끌 수 있다. 좁은 화면(breakpoint.sm 미만)에서는
        화살표 버튼이 자동으로 숨겨진다.
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
  {/* CarouselPrevious / CarouselNext 생략 */}
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
                <code>orientation</code> 등을 받고 내부 컨텍스트로 상태를 공유.
              </>
            ),
          },
          {
            name: "CarouselContent",
            description: (
              <>Embla 뷰포트와 트랙을 렌더링. 슬라이드를 담는 컨테이너.</>
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
            type: "boolean | number | AutoplayOptions",
            default: "false",
            description:
              "자동 재생(스텝). true=4초, 숫자=지연(ms), 객체=embla Autoplay 옵션. 마우스 오버 시 기본 일시정지. autoScroll과 동시 사용 X.",
          },
          {
            prop: "autoScroll",
            type: "boolean | number | AutoScrollOptions",
            default: "false",
            description:
              "자동 스크롤(연속). true=기본 속도, 숫자=speed(px/frame), 객체=embla AutoScroll 옵션. 보통 loop과 함께 쓴다.",
          },
          {
            prop: "opts",
            type: "EmblaOptionsType",
            default: "-",
            description: "Embla raw 옵션 escape hatch.",
          },
          {
            prop: "plugins",
            type: "EmblaPluginType[]",
            default: "-",
            description: "Autoplay 외 커스텀 플러그인을 얹을 때.",
          },
          {
            prop: "setApi",
            type: "(api: CarouselApi) => void",
            default: "-",
            description:
              "Embla API 인스턴스를 외부로 꺼내 직접 제어하고 싶을 때.",
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
