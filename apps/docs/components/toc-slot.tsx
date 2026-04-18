"use client";

import { usePathname } from "next/navigation";
import { PageTOC } from "@/components/page-toc";

export function TocSlot() {
  const pathname = usePathname();
  if (!pathname.startsWith("/components/")) return null;
  return <PageTOC />;
}
