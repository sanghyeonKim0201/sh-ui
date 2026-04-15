"use client";

import {
  MultiSelect,
  MultiSelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export function ChipMultiSelectDemo() {
  return (
    <MultiSelect defaultValue={["apple", "grapes"]}>
      <SelectTrigger style={{ width: "24rem" }}>
        <MultiSelectValue
          placeholder="과일 선택"
          render={(arr) => (
            <span className="hyeon-select__chips">
              {arr.map((v) => (
                <span key={v} className="hyeon-select__chip">{v}</span>
              ))}
            </span>
          )}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectContent>
    </MultiSelect>
  );
}
