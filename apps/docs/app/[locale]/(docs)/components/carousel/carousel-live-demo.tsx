"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
} from "./components/ui/carousel";
import { Card, CardContent } from "./components/ui/card";

const slides = [1, 2, 3, 4, 5];

export default function App() {
  return (
    <div style={{ padding: "0 2rem", width: "100%", maxWidth: 420 }}>
      <Carousel>
        <CarouselContent>
          {slides.map((n) => (
            <CarouselItem key={n}>
              <Card>
                <CardContent>
                  <div
                    style={{
                      display: "grid",
                      placeItems: "center",
                      height: "10rem",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                    }}
                  >
                    {n}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselIndicators />
      </Carousel>
    </div>
  );
}
`;

export function CarouselLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="carousel"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={640}
    />
  );
}
