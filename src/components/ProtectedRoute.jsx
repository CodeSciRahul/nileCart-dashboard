import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDefaultRouteForUser, isApprovedSeller } from "../lib/redirect.js";
import { BrandLogo } from "@/components/BrandLogo.jsx";

export function LoadingScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-gradient-to-br from-brand-cream/40 via-brand-white to-brand-cream/20">
      <BrandLogo subtitle="Dashboard" />
      <div className="flex items-center gap-2">
        <span className="size-2 animate-bounce rounded-full bg-brand-amber [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-brand-amber [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-brand-amber" />
      </div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

export function ProtectedRoute({
  children,
  roles = [],
  requireApprovedSeller = false,
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />;
  }

  if (requireApprovedSeller && !isApprovedSeller(user) && user.role !== "admin") {
    return <Navigate to="/seller/profile" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />;
  }

  return children;
}
