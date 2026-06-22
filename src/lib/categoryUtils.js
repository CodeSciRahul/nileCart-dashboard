export const emptyCategoryForm = {
  name: "",
  image: null,
  description: "",
  parent: "",
  department: "",
  displayOrder: 0,
  showInNav: true,
};

export const flattenCategoryTree = (nodes, depth = 0) =>
  (nodes || []).flatMap((node) => [
    { ...node, depth },
    ...flattenCategoryTree(node.children, depth + 1),
  ]);

export const PLACEHOLDER_GRADIENTS = [
  "from-amber-200 via-brand-amber to-amber-500",
  "from-orange-100 via-brand-cream to-brand-amber",
  "from-yellow-100 via-amber-300 to-orange-400",
  "from-brand-cream via-amber-200 to-amber-400",
];
