export const emptyCouponForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscount: "",
  usageLimit: "",
  maxUsesPerUser: "1",
  restoreOnCancel: false,
  eligibleUserType: "all",
  applicableCategories: [],
  startsAt: "",
  endsAt: "",
};

export const toDatetimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

export const refId = (value) => (value && typeof value === "object" ? value._id : value);

export const couponToForm = (coupon) => ({
  code: coupon.code || "",
  description: coupon.description || "",
  discountType: coupon.discountType || "percentage",
  discountValue: String(coupon.discountValue ?? ""),
  minOrderAmount: String(coupon.minOrderAmount ?? 0),
  maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
  usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
  maxUsesPerUser: String(coupon.maxUsesPerUser ?? 1),
  restoreOnCancel: Boolean(coupon.restoreOnCancel),
  eligibleUserType: coupon.eligibleUserType || "all",
  applicableCategories: (coupon.applicableCategories || []).map(refId),
  startsAt: toDatetimeLocal(coupon.startsAt),
  endsAt: toDatetimeLocal(coupon.endsAt),
});

export const couponToSelectedProducts = (coupon) =>
  (coupon.applicableProducts || []).map((p) =>
    typeof p === "object"
      ? { _id: p._id, title: p.title || p.slug || String(p._id) }
      : { _id: p, title: String(p) }
  );

export const buildCouponPayload = (form, selectedProducts) => {
  if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
    throw new Error("End date must be after start date");
  }

  const discountValue = Number(form.discountValue);
  if (!form.code?.trim()) throw new Error("Coupon code is required");
  if (!form.discountType) throw new Error("Discount type is required");
  if (Number.isNaN(discountValue) || discountValue < 0) {
    throw new Error("Enter a valid discount value");
  }

  return {
    code: form.code.trim().toUpperCase(),
    description: form.description?.trim() || undefined,
    discountType: form.discountType,
    discountValue,
    minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
    maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
    maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : 1,
    restoreOnCancel: Boolean(form.restoreOnCancel),
    eligibleUserType: form.eligibleUserType,
    sponsoredBy: "platform",
    seller: null,
    applicableCategories: form.applicableCategories || [],
    applicableProducts: selectedProducts.map((p) => p._id),
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
    endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
  };
};

export const formatCouponDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

export const formatDiscount = (coupon) =>
  coupon.discountType === "percentage"
    ? `${coupon.discountValue}%`
    : `₹${coupon.discountValue}`;
