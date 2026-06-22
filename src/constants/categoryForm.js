import { FolderTree, ImageIcon, Layers, LayoutList } from "lucide-react";

export const CATEGORY_GUIDE_STEPS = [
  {
    icon: FolderTree,
    title: "Choose structure",
    text: "Pick a parent department or leave empty to create a new top-level department.",
  },
  {
    icon: Layers,
    title: "Set details",
    text: "Add a clear name, optional description, and the correct department type.",
  },
  {
    icon: ImageIcon,
    title: "Add imagery",
    text: "Upload a category image shown on the storefront catalog and navigation.",
  },
  {
    icon: LayoutList,
    title: "Control display",
    text: "Set sort order and whether the category appears in storefront navigation.",
  },
];
