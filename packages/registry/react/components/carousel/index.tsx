"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import Autoplay, { type AutoplayOptionsType } from "embla-carousel-autoplay";
import AutoScroll, {
  type AutoScrollOptionsType,
} from "embla-carousel-auto-scroll";
import type {
  EmblaCarouselType,
  EmblaOptionsType,
  EmblaPluginType,
} from "embla-carousel";
import "./styles.css";

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

export type CarouselApi = EmblaCarouselType;

type Orientation = "horizontal" | "vertical";

interface CarouselContextValue {
  carouselRef: UseEmblaCarouselType[0];
  api: CarouselApi | undefined;
  orientation: Orientation;
  canPrev: boolean;
  canNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) {
    throw new Error("Carousel parts must be used within <Carousel>");
  }
  return ctx;
}

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 스크롤 방향. 기본 `horizontal`. */
  orientation?: Orientation;
  /** 끝에서 다시 처음으로 이어지는 무한 루프. */
  loop?: boolean;
  /**
   * 자동 재생 (스텝 모드). `true`면 4초 간격, 숫자를 주면 지연(ms), 객체를 주면
   * embla Autoplay 옵션 그대로 전달. 기본적으로 마우스가 올라가면 일시정지한다.
   * `autoScroll`과 동시에 쓰지 않는다.
   */
  autoPlay?: boolean | number | Partial<AutoplayOptionsType>;
  /**
   * 자동 스크롤 (연속 모드). 일정 속도로 흐르듯 움직인다. `true`면 기본 속도,
   * 숫자를 주면 `speed`(프레임당 픽셀), 객체를 주면 embla AutoScroll 옵션 그대로.
   * 보통 `loop`과 함께 쓴다. `autoPlay`와 동시에 쓰지 않는다.
   */
  autoScroll?: boolean | number | Partial<AutoScrollOptionsType>;
  /** Embla의 raw 옵션 escape hatch. `loop`/`orientation`과 충돌 시 prop이 우선. */
  opts?: EmblaOptionsType;
  /** 추가 플러그인. Autoplay 외 커스텀 플러그인을 얹을 때 사용. */
  plugins?: EmblaPluginType[];
  /** Embla API 인스턴스를 외부로 빼낼 때. */
  setApi?: (api: CarouselApi) => void;
}

/**
 * Embla 기반 캐러셀. 루프·자동재생·드래그·키보드 화살표를 지원하며,
 * prefers-reduced-motion 환경에서는 embla가 트랜지션을 알아서 비활성화한다.
 */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      className,
      orientation = "horizontal",
      loop,
      autoPlay,
      autoScroll,
      opts,
      plugins: userPlugins,
      setApi,
      children,
      onKeyDown: userOnKeyDown,
      ...props
    },
    ref,
  ) => {
    const autoplayPlugin = React.useMemo<EmblaPluginType | null>(() => {
      if (!autoPlay) return null;
      const defaults: Partial<AutoplayOptionsType> = {
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      };
      if (autoPlay === true) return Autoplay(defaults);
      if (typeof autoPlay === "number") {
        return Autoplay({ ...defaults, delay: autoPlay });
      }
      return Autoplay({ ...defaults, ...autoPlay });
    }, [autoPlay]);

    const autoScrollPlugin = React.useMemo<EmblaPluginType | null>(() => {
      if (!autoScroll) return null;
      const defaults: Partial<AutoScrollOptionsType> = {
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      };
      if (autoScroll === true) return AutoScroll(defaults);
      if (typeof autoScroll === "number") {
        return AutoScroll({ ...defaults, speed: autoScroll });
      }
      return AutoScroll({ ...defaults, ...autoScroll });
    }, [autoScroll]);

    const plugins = React.useMemo(() => {
      const arr: EmblaPluginType[] = [];
      if (autoplayPlugin) arr.push(autoplayPlugin);
      if (autoScrollPlugin) arr.push(autoScrollPlugin);
      if (userPlugins) arr.push(...userPlugins);
      return arr;
    }, [autoplayPlugin, autoScrollPlugin, userPlugins]);

    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
        loop: loop ?? opts?.loop,
      },
      plugins,
    );

    const [canPrev, setCanPrev] = React.useState(false);
    const [canNext, setCanNext] = React.useState(false);

    const onSelect = React.useCallback((instance: CarouselApi) => {
      setCanPrev(instance.canScrollPrev());
      setCanNext(instance.canScrollNext());
    }, []);

    React.useEffect(() => {
      if (!api) return;
      setApi?.(api);
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);
      return () => {
        api.off("reInit", onSelect);
        api.off("select", onSelect);
      };
    }, [api, onSelect, setApi]);

    const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
    const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        userOnKeyDown?.(event);
        if (event.defaultPrevented) return;
        const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
        const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
        if (event.key === prevKey) {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === nextKey) {
          event.preventDefault();
          scrollNext();
        }
      },
      [orientation, scrollPrev, scrollNext, userOnKeyDown],
    );

    const value = React.useMemo<CarouselContextValue>(
      () => ({
        carouselRef,
        api,
        orientation,
        canPrev,
        canNext,
        scrollPrev,
        scrollNext,
      }),
      [carouselRef, api, orientation, canPrev, canNext, scrollPrev, scrollNext],
    );

    return (
      <CarouselContext.Provider value={value}>
        <div
          ref={ref}
          className={cx("sh-ui-carousel", className)}
          data-orientation={orientation}
          role="region"
          aria-roledescription="carousel"
          onKeyDown={onKeyDown}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="sh-ui-carousel__viewport">
      <div
        ref={ref}
        className={cx("sh-ui-carousel__content", className)}
        data-orientation={orientation}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cx("sh-ui-carousel__item", className)}
      data-orientation={orientation}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

export const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, disabled, children, ...props }, ref) => {
  const { canPrev, scrollPrev, orientation } = useCarousel();
  return (
    <button
      ref={ref}
      type="button"
      aria-label="이전"
      className={cx("sh-ui-carousel__nav", "sh-ui-carousel__nav--prev", className)}
      data-orientation={orientation}
      disabled={disabled || !canPrev}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) scrollPrev();
      }}
      {...props}
    >
      {children ?? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d={orientation === "horizontal" ? "M10 4l-4 4 4 4" : "M4 10l4-4 4 4"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

export const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, disabled, children, ...props }, ref) => {
  const { canNext, scrollNext, orientation } = useCarousel();
  return (
    <button
      ref={ref}
      type="button"
      aria-label="다음"
      className={cx("sh-ui-carousel__nav", "sh-ui-carousel__nav--next", className)}
      data-orientation={orientation}
      disabled={disabled || !canNext}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) scrollNext();
      }}
      {...props}
    >
      {children ?? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d={orientation === "horizontal" ? "M6 4l4 4-4 4" : "M4 6l4 4 4-4"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
});
CarouselNext.displayName = "CarouselNext";
