import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import type { ShowcaseDemoProps, ShowcaseManifest } from "./types";

const Demo = ({ containerRef }: ShowcaseDemoProps) => (
  <Combobox items={["Apple", "Banana", "Grapes", "Mango", "Orange"]}>
    <ComboboxInput placeholder="과일 검색" style={{ width: "14rem" }} />
    <ComboboxContent container={containerRef}>
      <ComboboxList>
        {(item: string) => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxList>
      <ComboboxEmpty>일치하는 항목 없음</ComboboxEmpty>
    </ComboboxContent>
  </Combobox>
);

const showcase: ShowcaseManifest = {
  id: "combobox",
  label: "Combobox",
  category: "form",
  Demo,
};

export default showcase;
