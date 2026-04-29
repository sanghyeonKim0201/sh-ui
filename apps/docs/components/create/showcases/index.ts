import type { ShowcaseManifest } from "./types";

import accordion from "./accordion";
import avatar from "./avatar";
import badge from "./badge";
import breadcrumb from "./breadcrumb";
import button from "./button";
import card from "./card";
import carousel from "./carousel";
import checkbox from "./checkbox";
import colorPicker from "./color-picker";
import combobox from "./combobox";
import contextMenu from "./context-menu";
import datePicker from "./date-picker";
import dialog from "./dialog";
import dropdownMenu from "./dropdown-menu";
import fileUpload from "./file-upload";
import input from "./input";
import label from "./label";
import menubar from "./menubar";
import pagination from "./pagination";
import popover from "./popover";
import progress from "./progress";
import radio from "./radio";
import select from "./select";
import separator from "./separator";
import skeleton from "./skeleton";
import slider from "./slider";
import spinner from "./spinner";
import switchShowcase from "./switch";
import tabs from "./tabs";
import textarea from "./textarea";
import toast from "./toast";
import toggle from "./toggle";
import tooltip from "./tooltip";

export * from "./types";

export const SHOWCASES: ShowcaseManifest[] = [
  // action
  button,
  // form
  input,
  textarea,
  label,
  select,
  combobox,
  datePicker,
  fileUpload,
  colorPicker,
  // choice
  checkbox,
  switchShowcase,
  radio,
  toggle,
  slider,
  // display
  card,
  badge,
  avatar,
  progress,
  spinner,
  skeleton,
  separator,
  // overlay
  tooltip,
  dropdownMenu,
  popover,
  dialog,
  contextMenu,
  menubar,
  toast,
  // navigation
  tabs,
  accordion,
  breadcrumb,
  pagination,
  carousel,
];

export const SHOWCASE_BY_ID: Record<string, ShowcaseManifest> = Object.fromEntries(
  SHOWCASES.map((s) => [s.id, s]),
);
