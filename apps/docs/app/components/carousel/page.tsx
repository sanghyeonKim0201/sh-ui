export const dynamic = "force-static";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { CodePanel } from "@/components/ui/code-panel";
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
        Embla 기반 캐러셀. 터치 드래그·키보드 화살표·무한 루프·자동 재생을
        지원하며, <code>prefers-reduced-motion</code>은 embla가 자동으로
        존중한다.
      </p>
      <p className="muted">
        <em>Flutter 위젯은 아직 제공되지 않습니다. React 예제만 표시합니다.</em>
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
        <CodePanel
          language="tsx"
          code={`<Carousel>
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
</Carousel>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`npx sh-ui add carousel`}
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
      <CodePanel
        language="tsx"
        code={`import {
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
</Carousel>`}
      />
      <p className="muted">
        슬라이드 폭은 <code>CarouselItem</code>의 <code>flex-basis</code>(기본{" "}
        <code>100%</code>)로 제어한다. 여러 개를 한 번에 보여주려면{" "}
        <code>style</code>이나 <code>className</code>으로 덮어쓰면 된다.
      </p>

      <h2>Examples</h2>

      <h3>무한 루프</h3>
      <p className="muted">
        <code>loop</code>만 켜면 끝에서 처음으로, 처음에서 끝으로 이어진다. 자동
        재생은 꺼진 상태.
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
        <CodePanel language="tsx" code={`<Carousel loop>...</Carousel>`} />
      </Preview>

      <h3>자동 재생</h3>
      <p className="muted">
        <code>autoPlay</code>를 <code>true</code>로 주면 4초 간격으로 넘어간다.
        숫자를 주면 지연(ms)을 지정하며, 마우스가 올라가면 자동으로 멈춘다. 루프와
        독립적인 옵션이라 함께 켜거나 따로 켤 수 있다.
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
        <CodePanel
          language="tsx"
          code={`{/* 기본 4초 간격 */}
<Carousel autoPlay>...</Carousel>

{/* 지연 지정 (ms) */}
<Carousel autoPlay={2500}>...</Carousel>

{/* 객체로 세부 옵션 지정 */}
<Carousel autoPlay={{ delay: 3000, stopOnInteraction: true }}>
  ...
</Carousel>`}
        />
      </Preview>

      <h3>자동 스크롤 (연속 모드)</h3>
      <p className="muted">
        <code>autoScroll</code>은 한 장씩 끊어 넘기는 대신 일정 속도로 흐르듯
        움직인다. 로고 월이나 티커처럼 끊김 없는 흐름이 필요할 때 쓴다. 숫자를
        주면 <code>speed</code>(프레임당 픽셀)를 지정하며, 보통{" "}
        <code>loop</code>과 같이 켠다.
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
        <CodePanel
          language="tsx"
          code={`{/* 기본 속도 */}
<Carousel loop autoScroll>...</Carousel>

{/* 속도 지정 (px/frame) */}
<Carousel loop autoScroll={2}>...</Carousel>

{/* 역방향 + 마우스 오버 시 멈춤 끄기 */}
<Carousel
  loop
  autoScroll={{ direction: "backward", stopOnMouseEnter: false }}
>
  ...
</Carousel>`}
        />
      </Preview>

      <h3>루프 + 자동 재생</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ padding: "0 2rem", width: "100%", maxWidth: 420 }}>
            <Carousel loop autoPlay={3000}>
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
        <CodePanel
          language="tsx"
          code={`<Carousel loop autoPlay={3000}>...</Carousel>`}
        />
      </Preview>

      <h3>한 화면에 여러 슬라이드</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ padding: "0 2rem", width: "100%" }}>
            <Carousel loop>
              <CarouselContent>
                {slides.map((n) => (
                  <CarouselItem
                    key={n}
                    style={{ flex: "0 0 calc(33.333% - 0.667rem)" }}
                  >
                    <SlideTile n={n} height="6rem" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<CarouselItem style={{ flex: "0 0 calc(33.333% - 0.667rem)" }}>
  ...
</CarouselItem>`}
        />
      </Preview>

      <h3>세로 방향</h3>
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
        <CodePanel
          language="tsx"
          code={`<Carousel orientation="vertical" loop>
  <CarouselContent>
    <CarouselItem style={{ height: "6rem" }}>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          {
            name: "Carousel",
            description: (
              <>
                루트. <code>loop</code>, <code>autoPlay</code>,{" "}
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
        ]}
      />

      <h2>API Reference</h2>
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
    </main>
  );
}
