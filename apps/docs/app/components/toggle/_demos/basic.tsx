"use client";

import { Toggle, ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle";

function BoldIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path d="M4 2h5a3 3 0 0 1 0 6H4V2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 8h6a3 3 0 0 1 0 6H4V8Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path d="M10 2H6m4 12H6m4-12L8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path d="M4 2v5a4 4 0 0 0 8 0V2M3 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ToggleBasicDemo() {
  return (
    <Toggle aria-label="Bold">
      <BoldIcon />
    </Toggle>
  );
}

export function ToggleVariantDemo() {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Toggle variant="ghost" aria-label="Bold">
        <BoldIcon /> Ghost
      </Toggle>
      <Toggle variant="outline" aria-label="Italic">
        <ItalicIcon /> Outline
      </Toggle>
    </div>
  );
}

export function ToggleGroupSingleDemo() {
  return (
    <ToggleGroup variant="outline" defaultValue={["bold"]}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function ToggleGroupMultipleDemo() {
  return (
    <ToggleGroup variant="outline" multiple defaultValue={["bold", "italic"]}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
