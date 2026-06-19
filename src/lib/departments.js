export const DEPARTMENT_OPTIONS = [
  { value: "men", label: "Men", description: "Men's fashion, apparel & footwear" },
  { value: "women", label: "Women", description: "Women's fashion, apparel & footwear" },
  { value: "kids", label: "Kids", description: "Children's clothing & accessories" },
  { value: "sports", label: "Sports", description: "Activewear, gym & outdoor gear" },
  { value: "beauty", label: "Beauty", description: "Skincare, makeup & personal care" },
  { value: "home", label: "Home", description: "Home décor, linens & living essentials" },
  { value: "accessories", label: "Accessories", description: "Bags, jewellery & add-ons" },
];

export const departmentLabel = (value) =>
  DEPARTMENT_OPTIONS.find((opt) => opt.value === value)?.label || value;

export const formatParentDepartmentOption = (cat) => {
  const dept = cat.department ? departmentLabel(cat.department) : null;
  const slug = cat.slug ? ` /${cat.slug}` : "";
  if (dept) return `${cat.name} — ${dept} department${slug}`;
  return `${cat.name} — no department assigned${slug}`;
};
