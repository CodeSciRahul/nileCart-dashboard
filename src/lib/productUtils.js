import { normalizeStoredImages, serializeStoredImages } from "@/lib/storedImage.js";

export const createVariant = (overrides = {}) => ({
  key: crypto.randomUUID(),
  sku: "",
  size: "",
  color: "",
  stock: 0,
  price: 0,
  mrp: 0,
  images: [],
  ...overrides,
});

export const mapProductVariant = (variant) =>
  createVariant({
    sku: variant.sku || "",
    size: variant.size || "",
    color: variant.color || "",
    stock: variant.stock ?? 0,
    price: variant.price ?? 0,
    mrp: variant.mrp ?? 0,
    images: normalizeStoredImages(variant.images),
  });

export const buildProductPayload = (form) => ({
  title: form.title,
  description: form.description,
  category: form.category,
  gender: form.gender,
  images: serializeStoredImages(form.images),
  tags: form.tags,
  variants: form.variants.map(({ key, ...variant }) => ({
    sku: variant.sku.trim(),
    size: variant.size.trim(),
    color: variant.color.trim(),
    stock: Number(variant.stock) || 0,
    price: Number(variant.price),
    mrp: Number(variant.mrp),
    images: serializeStoredImages(variant.images),
  })),
});

export const flattenCategoryOptions = (nodes, parentName = "") =>
  (nodes || []).flatMap((node) => {
    const label = parentName ? `${parentName} › ${node.name}` : node.name;
    const children = flattenCategoryOptions(node.children, node.name);

    if (children.length > 0) {
      return children;
    }

    return [{ _id: node._id, label }];
  });

export const getVariantPriceRange = (variants) => {
  const prices = variants.map((v) => Number(v.price)).filter((p) => p > 0);
  if (!prices.length) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
};
