"use client";

import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  getPaginationRange,
} from "@/components/ui/pagination";

export function PaginationEllipsisDemo() {
  const [pageLarge, setPageLarge] = useState(5);
  const totalLarge = 20;
  const largeTokens = getPaginationRange({
    page: pageLarge,
    totalPages: totalLarge,
    siblings: 1,
  });

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={pageLarge === 1}
            data-disabled={pageLarge === 1 ? "" : undefined}
            onClick={(e) => {
              e.preventDefault();
              setPageLarge((p) => Math.max(1, p - 1));
            }}
          />
        </PaginationItem>
        {largeTokens.map((token, i) =>
          token === "dots" ? (
            <PaginationItem key={`dots-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={token}>
              <PaginationLink
                href="#"
                isActive={pageLarge === token}
                onClick={(e) => {
                  e.preventDefault();
                  setPageLarge(token);
                }}
              >
                {token}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={pageLarge === totalLarge}
            data-disabled={pageLarge === totalLarge ? "" : undefined}
            onClick={(e) => {
              e.preventDefault();
              setPageLarge((p) => Math.min(totalLarge, p + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
