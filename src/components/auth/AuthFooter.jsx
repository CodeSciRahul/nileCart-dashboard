import { Link } from "react-router-dom";

export function AuthFooter({ variant }) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      Use your email to receive a one-time verification code.
      <span className="ml-1">
        Admin access is restricted to seeded accounts.
      </span>
    </p>
  );
}
