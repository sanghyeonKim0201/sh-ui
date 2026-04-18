"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";

const koreanCities = [
  "서울",
  "부산",
  "인천",
  "대구",
  "대전",
  "광주",
  "울산",
  "수원",
  "성남",
  "용인",
];

export function ComboboxMultiChipsDemo() {
  return (
    <div style={{ width: "100%", maxWidth: "22rem" }}>
      <Combobox items={koreanCities} multiple>
        <ComboboxChips>
          <ComboboxValue>
            {(value: string[]) =>
              value.map((v) => (
                <ComboboxChip key={v}>
                  {v}
                  <ComboboxChipRemove />
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxInput placeholder="도시 추가..." />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>일치하는 도시가 없습니다.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
