import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import {
  Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption,
} from "./index";

function Sample(props: { selected?: boolean }) {
  return (
    <Table>
      <TableCaption>사용자 목록</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state={props.selected ? "selected" : undefined}>
          <TableCell>Kim</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow><TableCell>합계 1</TableCell></TableRow>
      </TableFooter>
    </Table>
  );
}

describe("Table primitives", () => {
  it("네이티브 table 구조를 렌더", () => {
    const { container } = render(<Sample />);
    expect(container.querySelector("table")).toBeTruthy();
    expect(container.querySelector("thead")).toBeTruthy();
    expect(container.querySelector("tbody")).toBeTruthy();
    expect(container.querySelector("tfoot")).toBeTruthy();
    expect(container.querySelector("caption")).toBeTruthy();
  });

  it("TableHead 는 th[scope=col]", () => {
    const { container } = render(<Sample />);
    const th = container.querySelector("th");
    expect(th?.getAttribute("scope")).toBe("col");
  });

  it("columnheader role 로 헤더 셀 접근", () => {
    render(<Sample />);
    expect(screen.getByRole("columnheader", { name: "이름" })).toBeTruthy();
  });

  it("data-state=selected 가 행에 반영", () => {
    const { container } = render(<Sample selected />);
    expect(container.querySelector('tbody tr[data-state="selected"]')).toBeTruthy();
  });

  it("className 이 병합된다", () => {
    const { container } = render(<Table className="custom"><TableBody><TableRow><TableCell>x</TableCell></TableRow></TableBody></Table>);
    expect(container.querySelector("table.custom")).toBeTruthy();
  });
});
