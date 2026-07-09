import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { GuestRoute, ProtectedRoute, LoadingScreen } from "./components/ProtectedRoute.jsx";
import { getDefaultRouteForUser } from "./lib/redirect.js";
import { setUnauthorizedHandler } from "./lib/api.js";
import Auth from "./pages/Auth.jsx";
import SellerHome from "./pages/seller/SellerHome.jsx";
import Onboarding from "./pages/seller/Onboarding.jsx";
import Profile from "./pages/seller/Profile.jsx";
import Products from "./pages/seller/Products.jsx";
import ProductForm from "./pages/seller/ProductForm.jsx";
import Orders from "./pages/seller/Orders.jsx";
import OrderDetail from "./pages/seller/OrderDetail.jsx";
import AdminHome from "./pages/admin/AdminHome.jsx";
import Sellers from "./pages/admin/Sellers.jsx";
import AdminSellerDetail from "./pages/admin/AdminSellerDetail.jsx";
import Users from "./pages/admin/Users.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import CouponsList from "./pages/admin/CouponsList.jsx";
import AdminCouponForm from "./pages/admin/CouponFormPage.jsx";
import Banners from "./pages/admin/Banners.jsx";
import AnnouncementsList from "./pages/admin/AnnouncementsList.jsx";
import AdminAnnouncementForm from "./pages/admin/AnnouncementForm.jsx";
import AdminCategoriesList from "./pages/admin/AdminCategoriesList.jsx";
import AdminCategoryForm from "./pages/admin/AdminCategoryForm.jsx";
import Payouts from "./pages/admin/Payouts.jsx";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) return <Navigate to="/auth" replace />;

  return <Navigate to={getDefaultRouteForUser(user)} replace />;
}

function AppRoutes() {
  const { logout } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      window.location.href = "/auth";
    });
  }, [logout]);

  return (
    <Routes>
      <Route path="/auth" element={<GuestRoute><Auth /></GuestRoute>} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/signup" element={<Navigate to="/auth" replace />} />
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/seller"
        element={
          <ProtectedRoute roles={["seller"]} requireApprovedSeller>
            <SellerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/onboarding"
        element={
          <ProtectedRoute roles={["seller"]}>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/profile"
        element={
          <ProtectedRoute roles={["seller"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products"
        element={
          <ProtectedRoute roles={["seller"]} requireApprovedSeller>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products/new"
        element={
          <ProtectedRoute roles={["seller"]} requireApprovedSeller>
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products/:id/edit"
        element={
          <ProtectedRoute roles={["seller"]} requireApprovedSeller>
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <ProtectedRoute roles={["seller"]} requireApprovedSeller>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/orders/:id"
        element={
          <ProtectedRoute roles={["seller"]} requireApprovedSeller>
            <OrderDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sellers"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Sellers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/seller/:id"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminSellerDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/coupons"
        element={
          <ProtectedRoute roles={["admin"]}>
            <CouponsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/coupons/new"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminCouponForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/coupons/:id/edit"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminCouponForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/banners"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Banners />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AnnouncementsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements/new"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminAnnouncementForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements/:id/edit"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminAnnouncementForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminCategoriesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories/new"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminCategoryForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories/:id/edit"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminCategoryForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payouts"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Payouts />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
