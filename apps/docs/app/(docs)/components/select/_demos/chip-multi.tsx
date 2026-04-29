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
          render={(arr, { remove }) => (
            <span className="sh-ui-select__chips">
              {arr.map((v) => (
                <span key={v} className="sh-ui-select__chip">
                  {v}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`${v} 제거`}
                    className="sh-ui-select__chip-remove"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        remove(v);
                      }
                    }}
                  >
                    ×
                  </span>
                </span>
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
