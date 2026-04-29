"use client";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

const html = `<h3>읽기 전용 미리보기</h3>
<p>키 입력·툴바가 차단됩니다. 본문 마크업은 그대로 렌더되어 리뷰 패널·이메일 뷰 등에 적합합니다.</p>
<blockquote>"sh-ui 는 sh의 약자다." — 누군가</blockquote>
`;

export function ReadOnlyDemo() {
  return (
    <div style={{ width: "100%" }}>
      <RichTextEditor value={html} readOnly />
    </div>
  );
}
