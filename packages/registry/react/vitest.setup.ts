import "@testing-library/jest-dom/vitest";

// jsdom 은 Document.elementFromPoint / Range.getClientRects 등 레이아웃 API 를
// 구현하지 않는다. ProseMirror(Placeholder 의 viewport 추적 등)가 호출하므로
// 테스트 환경에서 no-op 폴리필을 깐다(실제 좌표 측정은 헤드리스에서 무의미).
if (typeof document !== "undefined") {
  if (typeof document.elementFromPoint !== "function") {
    document.elementFromPoint = () => null;
  }
  if (typeof Range !== "undefined") {
    if (typeof Range.prototype.getClientRects !== "function") {
      Range.prototype.getClientRects = () =>
        ({ length: 0, item: () => null, [Symbol.iterator]: function* () {} }) as unknown as DOMRectList;
    }
    if (typeof Range.prototype.getBoundingClientRect !== "function") {
      Range.prototype.getBoundingClientRect = () =>
        ({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          toJSON: () => ({}),
        }) as DOMRect;
    }
  }
}
