"use client";

import * as React from "react";
import "./styles.css";


import { cn } from "@SH_UI_UTILS@";
type Orientation = "horizontal" | "vertical";

interface CarouselContextValue {
  orientation: Orientation;
  loop: boolean;
  index: number;
  count: number;
  goTo: (i: number) => void;
  goPrev: () => void;
  goNext: () => void;
  registerItem: () => () => void;
  setContentEl: (el: HTMLDivElement | null) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) {
    throw new Error("Carousel parts must be used within <Carousel>");
  }
  return ctx;
}

/** 현재 캐러셀 상태를 읽을 수 있는 hook. 커스텀 컨트롤을 만들 때 사용. */
export function useCarouselState(): Pick<
  CarouselContextValue,
  "orientation" | "loop" | "index" | "count" | "goTo" | "goPrev" | "goNext"
> {
  const { orientation, loop, index, count, goTo, goPrev, goNext } =
    useCarousel();
  return { orientation, loop, index, count, goTo, goPrev, goNext };
}

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 스크롤 방향. 기본 `horizontal`. */
  orientation?: Orientation;
  /** 끝에서 다시 처음으로 이어지는 무한 루프. */
  loop?: boolean;
  /** 자동 재생 간격(ms). `true`면 4000ms. */
  autoPlay?: boolean | number;
  /** 초기 인덱스. */
  defaultIndex?: number;
  /** 제어 모드 인덱스. */
  index?: number;
  /** 인덱스 변경 콜백. */
  onIndexChange?: (index: number) => void;
}

/**
 * 순수 CSS scroll-snap 기반 캐러셀. 터치 드래그·키보드 화살표·자동 재생을
 * 지원하며, prefers-reduced-motion 환경에서는 스냅 전환이 즉시 이동한다.
 *
 * 구성 요소: Carousel / CarouselContent / CarouselItem /
 * CarouselPrevious / CarouselNext / CarouselIndicators.
 */
export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      className,
      orientation = "horizontal",
      loop = false,
      autoPlay,
      defaultIndex = 0,
      index: controlledIndex,
      onIndexChange,
      children,
      onKeyDown: userOnKeyDown,
      ...props
    },
    ref,
  ) => {
    const isControlled = controlledIndex !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState(defaultIndex);
    const index = isControlled ? controlledIndex : uncontrolled;

    const [count, setCount] = React.useState(0);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const scrollTargetRef = React.useRef<number | null>(null);

    const setContentEl = React.useCallback((el: HTMLDivElement | null) => {
      contentRef.current = el;
    }, []);

    const registerItem = React.useCallback(() => {
      setCount((c) => c + 1);
      return () => setCount((c) => Math.max(0, c - 1));
    }, []);

    const setIndex = React.useCallback(
      (next: number) => {
        if (!isControlled) setUncontrolled(next);
        onIndexChange?.(next);
      },
      [isControlled, onIndexChange],
    );

    const clamp = React.useCallback(
      (i: number) => {
        if (count <= 0) return 0;
        if (loop) {
          return ((i % count) + count) % count;
        }
        return Math.max(0, Math.min(count - 1, i));
      },
      [count, loop],
    );

    const goTo = React.useCallback(
      (i: number) => setIndex(clamp(i)),
      [clamp, setIndex],
    );
    const goPrev = React.useCallback(
      () => setIndex(clamp(index - 1)),
      [clamp, index, setIndex],
    );
    const goNext = React.useCallback(
      () => setIndex(clamp(index + 1)),
      [clamp, index, setIndex],
    );

    // 인덱스 변경 시 프로그래매틱 스크롤
    React.useEffect(() => {
      const el = contentRef.current;
      if (!el) return;
      const child = el.children[index] as HTMLElement | undefined;
      if (!child) return;
      scrollTargetRef.current = index;
      if (orientation === "horizontal") {
        el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
      } else {
        el.scrollTo({ top: child.offsetTop, behavior: "smooth" });
      }
    }, [index, orientation, count]);

    // 사용자 스와이프/스크롤 → 인덱스 동기화
    React.useEffect(() => {
      const el = contentRef.current;
      if (!el) return;
      let raf = 0;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const children = Array.from(el.children) as HTMLElement[];
          if (children.length === 0) return;
          const axis = orientation === "horizontal" ? "offsetLeft" : "offsetTop";
          const scroll =
            orientation === "horizontal" ? el.scrollLeft : el.scrollTop;
          let nearest = 0;
          let minDelta = Infinity;
          children.forEach((c, i) => {
            const d = Math.abs(c[axis] - scroll);
            if (d < minDelta) {
              minDelta = d;
              nearest = i;
            }
          });
          if (nearest !== index) {
            // 프로그래매틱 이동 중이면 target 도착까지 무시
            if (
              scrollTargetRef.current !== null &&
              nearest !== scrollTargetRef.current
            ) {
              return;
            }
            scrollTargetRef.current = null;
            setIndex(nearest);
          } else {
            scrollTargetRef.current = null;
          }
        });
      };
      el.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        cancelAnimationFrame(raf);
        el.removeEventListener("scroll", onScroll);
      };
    }, [orientation, index, setIndex]);

    // 자동 재생 — 호버·키보드 포커스 시 일시정지(WCAG 2.2.2).
    React.useEffect(() => {
      if (!autoPlay || count <= 1) return;
      const delay = autoPlay === true ? 4000 : autoPlay;
      const el = contentRef.current;
      let paused = false;
      const pause = () => (paused = true);
      const resume = () => (paused = false);
      el?.addEventListener("mouseenter", pause);
      el?.addEventListener("mouseleave", resume);
      el?.addEventListener("focusin", pause);
      el?.addEventListener("focusout", resume);
      const id = window.setInterval(() => {
        if (paused) return;
        setIndex(clamp(index + 1));
      }, delay);
      return () => {
        window.clearInterval(id);
        el?.removeEventListener("mouseenter", pause);
        el?.removeEventListener("mouseleave", resume);
        el?.removeEventListener("focusin", pause);
        el?.removeEventListener("focusout", resume);
      };
    }, [autoPlay, count, index, clamp, setIndex]);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        userOnKeyDown?.(event);
        if (event.defaultPrevented) return;
        const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
        const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
        if (event.key === prevKey) {
          event.preventDefault();
          goPrev();
        } else if (event.key === nextKey) {
          event.preventDefault();
          goNext();
        }
      },
      [orientation, goPrev, goNext, userOnKeyDown],
    );

    const value = React.useMemo<CarouselContextValue>(
      () => ({
        orientation,
        loop,
        index,
        count,
        goTo,
        goPrev,
        goNext,
        registerItem,
        setContentEl,
        contentRef,
      }),
      [
        orientation,
        loop,
        index,
        count,
        goTo,
        goPrev,
        goNext,
        registerItem,
        setContentEl,
      ],
    );

    return (
      <CarouselContext.Provider value={value}>
        <div
          ref={ref}
          className={cn("sh-ui-carousel", className)}
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
  const { orientation, setContentEl } = useCarousel();

  const mergedRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      setContentEl(el);
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    },
    [ref, setContentEl],
  );

  return (
    <div
      ref={mergedRef}
      className={cn("sh-ui-carousel__content", className)}
      data-orientation={orientation}
      {...props}
    />
  );
});
CarouselContent.displayName = "CarouselContent";

export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation, registerItem } = useCarousel();

  React.useEffect(() => registerItem(), [registerItem]);

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn("sh-ui-carousel__item", className)}
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
  const { goPrev, orientation, index, count, loop } = useCarousel();
  const atStart = !loop && index <= 0;
  return (
    <button
      ref={ref}
      type="button"
      aria-label="이전"
      className={cn("sh-ui-carousel__nav", "sh-ui-carousel__nav--prev", className)}
      data-orientation={orientation}
      disabled={disabled || atStart || count === 0}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) goPrev();
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
  const { goNext, orientation, index, count, loop } = useCarousel();
  const atEnd = !loop && index >= count - 1;
  return (
    <button
      ref={ref}
      type="button"
      aria-label="다음"
      className={cn("sh-ui-carousel__nav", "sh-ui-carousel__nav--next", className)}
      data-orientation={orientation}
      disabled={disabled || atEnd || count === 0}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) goNext();
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

export interface CarouselIndicatorsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 각 도트 버튼에 전달할 aria-label 빌더. */
  labelFor?: (index: number) => string;
}

export const CarouselIndicators = React.forwardRef<
  HTMLDivElement,
  CarouselIndicatorsProps
>(({ className, labelFor, ...props }, ref) => {
  const { count, index, goTo, orientation } = useCarousel();
  if (count <= 0) return null;
  return (
    <div
      ref={ref}
      role="tablist"
      aria-label="슬라이드 선택"
      className={cn("sh-ui-carousel__indicators", className)}
      data-orientation={orientation}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === index}
          aria-label={labelFor ? labelFor(i) : `${i + 1}번 슬라이드`}
          className="sh-ui-carousel__indicator"
          data-active={i === index || undefined}
          onClick={() => goTo(i)}
        />
      ))}
    </div>
  );
});
CarouselIndicators.displayName = "CarouselIndicators";
