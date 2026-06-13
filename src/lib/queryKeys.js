export const queryKeys = {
  auth: {
    session: ["auth", "session"],
  },
  seller: {
    profile: ["seller", "profile"],
    stats: ["seller", "stats"],
    products: (filters) => ["seller", "products", filters],
    orders: (filters) => ["seller", "orders", filters],
    order: (id) => ["seller", "orders", id],
  },
  admin: {
    stats: ["admin", "stats"],
    sellers: (status) => ["admin", "sellers", status],
    seller: (id) => ["admin", "sellers", "detail", id],
    users: (role) => ["admin", "users", role],
    orders: (filters) => ["admin", "orders", filters],
    coupons: ["admin", "coupons"],
    banners: ["admin", "banners"],
    categories: ["admin", "categories"],
  },
  categories: {
    all: ["categories"],
  },
};
