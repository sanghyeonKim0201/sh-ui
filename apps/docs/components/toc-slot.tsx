"use client";

import { usePathname } from "next/navigation";
import { PageTOC } from "@/components/ui/page-toc";

export function TocSlot() {
  const pathname = usePathname();
  if (!pathname.startsWith("/components/")) return null;
  // routeKey 로 라우트 변경 자동 재스캔, excludeSelector 로 Preview 안의 헤딩(시뮬 페이지 등) 무시
  return <PageTOC routeKey={pathname} excludeSelector=".sh-ui-preview" />;
}
