import {
  BookOpen,
  ImageIcon,
  Layers,
  Package,
  Tag,
} from "lucide-react";

export const PRODUCT_GENDER_OPTIONS = [
  { value: "Women", label: "Women" },
  { value: "Men", label: "Men" },
];

export const PRODUCT_FORM_GUIDE_STEPS = [
  {
    icon: Package,
    title: "Basic details",
    summary: "Title and description shoppers see on your product page.",
    details: [
      "Use a clear, searchable title (brand + product type + key attribute).",
      "Description can include fabric, fit, care instructions, and sizing notes.",
    ],
    example: "Women's Black Puff Sleeve Cotton Top",
  },
  {
    icon: Layers,
    title: "Category & gender",
    summary: "Helps customers find your product in the right browse path.",
    details: [
      "Pick the most specific leaf category available.",
      "Gender filters which storefront sections include this listing.",
    ],
  },
  {
    icon: ImageIcon,
    title: "Product images",
    summary: "High-quality photos increase conversion.",
    details: [
      "Upload JPEG, PNG, or WEBP via presigned S3 URLs.",
      "First image becomes the cover shown in search and category grids.",
      "Add variant-specific images for different colors or styles.",
    ],
  },
  {
    icon: Tag,
    title: "Tags",
    summary: "Optional keywords for search and filtering.",
    details: [
      "Use short, relevant terms: season, material, occasion, style.",
      "Avoid duplicate tags — each tag is stored once.",
    ],
    example: "summer, cotton, casual",
  },
  {
    icon: BookOpen,
    title: "Variants",
    summary: "One row per SKU — size, color, price, and stock.",
    details: [
      "SKU must be unique across all variants on this product.",
      "Price and MRP are required and must be greater than zero.",
      "Stock defaults to 0 if left empty.",
    ],
    example: "SKU: TOP-BLK-M · Size M · Color Black · ₹299 / MRP ₹495",
  },
];

export const PRODUCT_FORM_GUIDE_TIPS = [
  "MRP should be the original price; selling price is what customers pay.",
  "You need at least one variant — add more for each size/color combination.",
  "Variant images are optional but help when colors look different in photos.",
];
