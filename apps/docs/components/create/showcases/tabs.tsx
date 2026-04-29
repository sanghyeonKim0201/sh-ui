import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <Tabs defaultValue="overview" style={{ maxWidth: 480 }}>
    <TabsList>
      <TabsTrigger value="overview">개요</TabsTrigger>
      <TabsTrigger value="analytics">분석</TabsTrigger>
      <TabsTrigger value="reports">보고서</TabsTrigger>
    </TabsList>
    <TabsContent value="overview" style={{ paddingTop: "0.75rem" }}>
      개요 탭의 내용입니다.
    </TabsContent>
    <TabsContent value="analytics" style={{ paddingTop: "0.75rem" }}>
      분석 탭의 내용입니다.
    </TabsContent>
    <TabsContent value="reports" style={{ paddingTop: "0.75rem" }}>
      보고서 탭의 내용입니다.
    </TabsContent>
  </Tabs>
);

const showcase: ShowcaseManifest = {
  id: "tabs",
  label: "Tabs",
  category: "navigation",
  Demo,
};

export default showcase;
