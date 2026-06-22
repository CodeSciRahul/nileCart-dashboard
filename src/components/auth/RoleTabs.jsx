import { cn } from "@/lib/utils";

export function RoleTabs({ value, onChange }) {
  const roles = [
    { id: "seller", label: "Seller" },
    { id: "admin", label: "Admin" },
  ];

  return (
    <div className="inline-flex rounded-full border border-brand-amber/20 bg-brand-cream/50 p-1 ring-1 ring-brand-amber/10">
      {roles.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => onChange(role.id)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
            value === role.id
              ? "bg-brand-amber text-foreground shadow-sm ring-1 ring-brand-amber/20"
              : "text-brand-gray hover:text-foreground",
          )}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
