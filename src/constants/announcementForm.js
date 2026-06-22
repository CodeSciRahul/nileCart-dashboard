import { CalendarClock, Megaphone, Palette, ToggleLeft } from "lucide-react";

export const ANNOUNCEMENT_GUIDE_STEPS = [
  {
    icon: Megaphone,
    title: "Write your message",
    text: "Keep it short and clear — this appears in the storefront announcement bar.",
  },
  {
    icon: Palette,
    title: "Style the banner",
    text: "Pick background and text colors that match your brand and stay readable.",
  },
  {
    icon: CalendarClock,
    title: "Set schedule",
    text: "Optionally set start and end times, plus priority for display order.",
  },
  {
    icon: ToggleLeft,
    title: "Go live",
    text: "Toggle Active to show or hide the announcement on the storefront.",
  },
];
