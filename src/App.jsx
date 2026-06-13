import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { GuestRoute, ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { getDefaultRouteForUser } from "./lib/redirect.js";
import { setUnauthorizedHandler } from "./lib/api.js";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
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
import Coupons from "./pages/admin/Coupons.jsx";
import Banners from "./pages/admin/Banners.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import Payouts from "./pages/admin/Payouts.jsx";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={getDefaultRouteForUser(user)} replace />;
}

function AppRoutes() {
  const { logout } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      window.location.href = "/login";
    });
  }, [logout]);

  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
      <Route path="/" element={<RootRedirect />} />

      <Route path="/seller" element={<SellerHome />} />
      <Route path="/seller/onboarding" element={<Onboarding />} />
      <Route path="/seller/profile" element={<Profile />} />
      <Route path="/seller/products" element={<Products />} />
      <Route path="/seller/products/new" element={<ProductForm />} />
      <Route path="/seller/products/:id/edit" element={<ProductForm />} />
      <Route path="/seller/orders" element={<Orders />} />
      <Route path="/seller/orders/:id" element={<OrderDetail />} />

      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/sellers" element={<Sellers />} />
      <Route path="/admin/seller/:id" element={<AdminSellerDetail />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/coupons" element={<Coupons />} />
      <Route path="/admin/banners" element={<Banners />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/payouts" element={<Payouts />} />

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
