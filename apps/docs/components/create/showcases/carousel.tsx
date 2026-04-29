import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
} from "@/components/ui/carousel";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <Carousel loop style={{ maxWidth: 480 }}>
    <CarouselContent>
      {["하나", "둘", "셋", "넷"].map((label) => (
        <CarouselItem key={label}>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "8rem",
              background: "var(--background-muted)",
              borderRadius: "var(--radius)",
              fontSize: "1.25rem",
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
    <CarouselIndicators />
  </Carousel>
);

const showcase: ShowcaseManifest = {
  id: "carousel",
  label: "Carousel",
  category: "navigation",
  Demo,
};

export default showcase;
