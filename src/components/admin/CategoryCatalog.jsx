import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge.jsx";
import { Button, ButtonLink } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { getImageUrl } from "@/lib/storedImage.js";
import { departmentLabel } from "@/lib/departments.js";
import { PLACEHOLDER_GRADIENTS } from "@/lib/categoryUtils.js";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  FolderTree,
  Layers,
  Navigation,
  Power,
  PowerOff,
  Sparkles,
} from "lucide-react";

function CategoryImage({ category, index, compact = false }) {
  const imageUrl = getImageUrl(category.image);
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={category.name}
        className={cn(
          "object-cover transition-transform duration-500 group-hover:scale-105",
          compact ? "size-10 rounded-lg" : "h-full w-full"
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br font-black text-brand-white/90",
        gradient,
        compact ? "size-10 rounded-lg text-sm" : "h-full w-full text-4xl"
      )}
    >
      {category.name?.charAt(0) || "?"}
    </div>
  );
}

function SubcategoryRow({ category, index, onDeactivate, onActivate, isActivating }) {
  return (
    <div
      className="group flex animate-in fade-in slide-in-from-left-2 items-center gap-3 rounded-xl border border-brand-amber/10 bg-brand-white/80 p-3 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-brand-amber/25 hover:bg-brand-cream/40 hover:shadow-md [animation-fill-mode:both]"
      style={{ animationDelay: `${index * 60}ms`, animationDuration: "400ms" }}
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-brand-amber/15">
        <CategoryImage category={category} index={index} compact />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{category.name}</p>
        <p className="truncate text-xs text-muted-foreground">/{category.slug}</p>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <Badge variant="secondary">Order {category.displayOrder ?? 0}</Badge>
        <Badge variant={category.showInNav ? "default" : "secondary"}>
          <Navigation className="mr-1 size-3" />
          {category.showInNav ? "Nav" : "Hidden"}
        </Badge>
        <Badge variant={category.isActive ? "success" : "secondary"}>
          {category.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <ButtonLink
          size="sm"
          variant="outline"
          to={`/admin/categories/${category._id}/edit`}
          className="border-brand-amber/20"
        >
          <Edit3 className="size-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </ButtonLink>
        {category.isActive ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDeactivate(category._id)}
          >
            <PowerOff className="size-3.5" />
            <span className="hidden sm:inline">Deactivate</span>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={isActivating}
            onClick={() => onActivate(category._id)}
          >
            <Power className="size-3.5" />
            <span className="hidden sm:inline">Activate</span>
          </Button>
        )}
      </div>
    </div>
  );
}

function DepartmentCard({
  department,
  index,
  onDeactivate,
  onActivate,
  isActivating,
}) {
  const [expanded, setExpanded] = useState(true);
  const children = department.children || [];
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
  const deptLabel = department.department
    ? departmentLabel(department.department)
    : "Unassigned";

  return (
    <Card
      className="group/dept relative overflow-hidden border-brand-amber/25 p-0 transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-amber/40 hover:shadow-lg hover:shadow-brand-amber/10 animate-in fade-in slide-in-from-bottom-4 [animation-fill-mode:both]"
      style={{ animationDelay: `${index * 100}ms`, animationDuration: "500ms" }}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br opacity-30 blur-3xl transition-opacity duration-500 group-hover/dept:opacity-50",
          gradient
        )}
      />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-brand-amber/30 to-transparent" />

      <div className="relative flex flex-col lg:flex-row">
        <div className="relative shrink-0 overflow-hidden lg:w-52 xl:w-56">
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", gradient)} />
          <div className="relative flex aspect-[4/3] items-center justify-center p-5 lg:aspect-auto lg:h-full lg:min-h-[168px]">
            <div className="relative size-full max-h-32 max-w-[140px] overflow-hidden rounded-2xl shadow-xl shadow-black/10 ring-2 ring-brand-white/80 transition-transform duration-500 group-hover/dept:scale-[1.03] group-hover/dept:-rotate-1 lg:max-h-36 lg:max-w-[160px]">
              <CategoryImage category={department} index={index} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-brand-amber/10" />
            </div>
          </div>
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gray shadow-sm ring-1 ring-brand-amber/15 backdrop-blur-sm">
              <FolderTree className="size-3 text-brand-amber" />
              Department
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full ring-2 ring-brand-white",
                      department.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-brand-gray/40"
                    )}
                  />
                  <h3 className="truncate text-xl font-black tracking-tight text-foreground">
                    {department.name}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-md bg-brand-cream/80 px-2 py-0.5 font-medium text-foreground ring-1 ring-brand-amber/10">
                    {deptLabel}
                  </span>
                  <span className="text-brand-gray">·</span>
                  <code className="rounded-md bg-brand-white px-2 py-0.5 text-xs font-medium text-brand-gray ring-1 ring-brand-amber/10">
                    /{department.slug}
                  </code>
                  {department.displayOrder != null && (
                    <>
                      <span className="text-brand-gray">·</span>
                      <span className="text-xs">Order {department.displayOrder}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="gap-1 shadow-sm">
                  <Layers className="size-3" />
                  {children.length} sub
                </Badge>
                <Badge variant={department.showInNav ? "default" : "secondary"} className="gap-1">
                  <Navigation className="size-3" />
                  {department.showInNav ? "In nav" : "Hidden"}
                </Badge>
                <Badge variant={department.isActive ? "success" : "secondary"}>
                  {department.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-brand-amber/10 pt-4">
              <ButtonLink
                size="sm"
                variant="outline"
                to={`/admin/categories/${department._id}/edit`}
                className="border-brand-amber/25 bg-brand-white shadow-sm hover:bg-brand-cream"
              >
                <Edit3 className="size-3.5" />
                Edit
              </ButtonLink>
              {department.isActive ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeactivate(department._id)}
                >
                  <PowerOff className="size-3.5" />
                  Deactivate
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isActivating}
                  onClick={() => onActivate(department._id)}
                >
                  <Power className="size-3.5" />
                  Activate
                </Button>
              )}
              {children.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpanded((v) => !v)}
                  className="ml-auto gap-1.5 text-brand-gray hover:bg-brand-cream/60 hover:text-foreground"
                >
                  {expanded ? (
                    <ChevronDown className="size-4 transition-transform" />
                  ) : (
                    <ChevronRight className="size-4 transition-transform" />
                  )}
                  {expanded ? "Collapse" : "Expand"} subcategories
                  <span className="rounded-full bg-brand-amber/20 px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                    {children.length}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {children.length > 0 && (
        <div
          className={cn(
            "grid transition-all duration-500 ease-in-out",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-2 border-t border-brand-amber/15 bg-gradient-to-b from-brand-cream/30 via-brand-cream/10 to-brand-white px-5 py-4 sm:px-6">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-brand-gray">
                <Sparkles className="size-3.5 text-brand-amber" />
                Subcategories
              </p>
              <div className="space-y-2">
                {children.map((child, childIndex) => (
                  <SubcategoryRow
                    key={child._id}
                    category={child}
                    index={childIndex}
                    onDeactivate={onDeactivate}
                    onActivate={onActivate}
                    isActivating={isActivating}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function CatalogSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl border border-brand-amber/10 bg-brand-cream/30"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function CategoryCatalog({
  categoryTree,
  isLoading,
  onDeactivate,
  onActivate,
  isActivating,
}) {
  const stats = useMemo(() => {
    const departments = categoryTree.length;
    const subcategories = categoryTree.reduce(
      (sum, dept) => sum + (dept.children?.length || 0),
      0
    );
    const active = categoryTree.reduce((sum, dept) => {
      let count = dept.isActive ? 1 : 0;
      count += (dept.children || []).filter((c) => c.isActive).length;
      return sum + count;
    }, 0);
    return { departments, subcategories, active, total: departments + subcategories };
  }, [categoryTree]);

  if (isLoading) {
    return <CatalogSkeleton />;
  }

  if (categoryTree.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/20">
          <FolderTree className="size-8" />
        </span>
        <div>
          <p className="font-bold text-lg">No categories yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first department to start building the catalog.
          </p>
        </div>
        <ButtonLink to="/admin/categories/new">Create category</ButtonLink>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Departments", value: stats.departments, icon: FolderTree },
          { label: "Subcategories", value: stats.subcategories, icon: Layers },
          { label: "Active items", value: stats.active, icon: Sparkles },
        ].map(({ label, value, icon: Icon }, i) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-brand-amber/15 bg-brand-white/80 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 [animation-fill-mode:both]"
            style={{ animationDelay: `${i * 80}ms`, animationDuration: "400ms" }}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-amber/15 text-brand-amber ring-1 ring-brand-amber/20">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                {label}
              </p>
              <p className="text-2xl font-black">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {categoryTree.map((department, index) => (
          <DepartmentCard
            key={department._id}
            department={department}
            index={index}
            onDeactivate={onDeactivate}
            onActivate={onActivate}
            isActivating={isActivating}
          />
        ))}
      </div>
    </div>
  );
}
