"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const fruits = [
  "Apple",
  "Banana",
  "Blueberry",
  "Cherry",
  "Grapes",
  "Kiwi",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pineapple",
  "Strawberry",
  "Watermelon",
];

export function ComboboxBasicDemo() {
  return (
    <div style={{ width: "100%", maxWidth: "18rem" }}>
      <Combobox items={fruits}>
        <ComboboxInput placeholder="과일 검색..." />
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>일치하는 항목이 없습니다.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
