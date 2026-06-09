export const getDefaultRouteForUser = (user) => {
  if (!user) return "/login";

  if (user.role === "admin") return "/admin";

  if (user.role === "seller") {
    if (!user.seller) return "/seller/onboarding";
    if (user.seller.approvalStatus === "Approved") return "/seller";
    return "/seller/profile";
  }

  return "/login";
};

export const isApprovedSeller = (user) =>
  user?.role === "seller" && user?.seller?.approvalStatus === "Approved";

export const hasSellerProfile = (user) => !!user?.seller;
