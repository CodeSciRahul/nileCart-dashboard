import { Link } from "react-router-dom";

export function AuthFooter({ variant }) {
  if (variant === "login") {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    );
  }

  return (
    <p className="text-center text-sm text-muted-foreground">
      Already have an account?{" "}
      <Link to="/login" className="font-medium text-primary hover:underline">
        Sign in
      </Link>
    </p>
  );
}
