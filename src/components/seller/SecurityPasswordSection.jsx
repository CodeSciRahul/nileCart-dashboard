import { useState } from "react";
import { KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { PasswordInput } from "@/components/ui/password-input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { setPassword, changePassword } from "@/services/authService.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from "sonner";

export function SecurityPasswordSection() {
  const { user, refreshProfile } = useAuth();
  const hasPassword = Boolean(user?.hasPassword);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (hasPassword) {
        if (!currentPassword) {
          toast.error("Please enter your current password.");
          setLoading(false);
          return;
        }

        await changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });
        toast.success("Password changed successfully.");
      } else {
        await setPassword({
          password: newPassword,
          confirmPassword,
        });
        toast.success("Password configured successfully.");
      }

      resetForm();
      await refreshProfile();
    } catch (err) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-amber/15 bg-brand-white/80 shadow-sm">
      <div className="flex items-start justify-between border-b border-brand-amber/10 bg-gradient-to-r from-brand-cream/40 to-brand-white px-5 py-4">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-brand-amber" />
          <div>
            <h3 className="font-bold tracking-tight text-foreground">
              Security & Password
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {hasPassword
                ? "Update your account password for secure dashboard access."
                : "Create a password to enable password-based login in addition to OTP."}
            </p>
          </div>
        </div>

        <Badge
          variant={hasPassword ? "default" : "secondary"}
          className="text-xs"
        >
          {hasPassword ? (
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3" />
              Password Configured
            </span>
          ) : (
            "OTP Only"
          )}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5 max-w-lg">
        {hasPassword && (
          <div className="space-y-1.5">
            <Label htmlFor="current-pw" className="text-sm font-medium">
              Current password *
            </Label>
            <PasswordInput
              id="current-pw"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="new-pw" className="text-sm font-medium">
            {hasPassword ? "New password *" : "Create password *"}
          </Label>
          <PasswordInput
            id="new-pw"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-pw" className="text-sm font-medium">
            Confirm new password *
          </Label>
          <PasswordInput
            id="confirm-pw"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="gap-1.5 px-5 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <KeyRound className="size-3.5" />
              {hasPassword ? "Change Password" : "Set Password"}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

