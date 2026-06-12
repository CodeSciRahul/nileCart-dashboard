import { cn } from "@/lib/utils";

export function RoleTabs({ value, onChange }) {
  const roles = [
    { id: "seller", label: "Seller" },
    { id: "admin", label: "Admin" },
  ];

  return (
    <div className="inline-flex rounded-full border border-border bg-muted/50 p-0.5">
      {roles.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => onChange(role.id)}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-medium transition-all",
            value === role.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
