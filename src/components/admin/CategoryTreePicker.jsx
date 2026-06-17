import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { cn } from "@/lib/utils";

const idKey = (id) => String(id);

const collectDescendantIds = (node) => {
  const ids = [idKey(node._id)];
  for (const child of node.children || []) {
    ids.push(...collectDescendantIds(child));
  }
  return ids;
};

const filterCategoryTree = (nodes, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const filterNode = (node) => {
    const nameMatches = node.name.toLowerCase().includes(q);
    const filteredChildren = (node.children || [])
      .map(filterNode)
      .filter(Boolean);

    if (nameMatches || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    return null;
  };

  return (nodes || []).map(filterNode).filter(Boolean);
};

function CategoryTreeNode({ node, depth, selectedIds, onToggle }) {
  const hasChildren = (node.children || []).length > 0;
  const descendantIds = hasChildren ? collectDescendantIds(node) : [idKey(node._id)];
  const selectedSet = new Set(selectedIds.map(idKey));
  const selectedCount = descendantIds.filter((id) => selectedSet.has(id)).length;
  const isChecked = hasChildren
    ? selectedCount === descendantIds.length
    : selectedSet.has(idKey(node._id));
  const isIndeterminate =
    hasChildren && selectedCount > 0 && selectedCount < descendantIds.length;

  return (
    <div className="select-none">
      <label
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 text-sm hover:bg-muted/50",
          depth > 0 && "border-l border-border"
        )}
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          ref={(el) => {
            if (el) el.indeterminate = isIndeterminate;
          }}
          onChange={(e) => onToggle(node, e.target.checked)}
          className="size-4 shrink-0 rounded border-input"
        />
        <span className={cn(hasChildren && "font-medium")}>{node.name}</span>
        {hasChildren && (
          <span className="text-muted-foreground text-xs">
            ({node.children.length} sub)
          </span>
        )}
      </label>
      {(node.children || []).map((child) => (
        <CategoryTreeNode
          key={child._id}
          node={child}
          depth={depth + 1}
          selectedIds={selectedIds}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export function CategoryTreePicker({ tree = [], selectedIds = [], onChange }) {
  const [search, setSearch] = useState("");

  const filteredTree = useMemo(
    () => filterCategoryTree(tree, search),
    [tree, search]
  );

  const handleToggle = (node, checked) => {
    const hasChildren = (node.children || []).length > 0;
    const targetIds = hasChildren ? collectDescendantIds(node) : [idKey(node._id)];
    const selectedSet = new Set(selectedIds.map(idKey));

    if (checked) {
      targetIds.forEach((id) => selectedSet.add(id));
      onChange([...selectedSet]);
      return;
    }

    targetIds.forEach((id) => selectedSet.delete(id));
    onChange([...selectedSet]);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="category-search">Applicable categories (optional)</Label>
      <p className="text-muted-foreground text-xs">
        Leave empty to apply to all categories. Selecting a parent includes all its
        children. Selecting a child only applies to that category.
      </p>
      {/* <Input
        id="category-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search categories..."
      /> */}
      <div className="max-h-52 overflow-y-auto rounded-lg border border-border p-2">
        {filteredTree.length === 0 ? (
          <p className="text-muted-foreground p-2 text-sm">
            {tree.length === 0 ? "No categories found" : "No categories match your search"}
          </p>
        ) : (
          filteredTree.map((node) => (
            <CategoryTreeNode
              key={node._id}
              node={node}
              depth={0}
              selectedIds={selectedIds}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>
      {selectedIds.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {selectedIds.length} categor{selectedIds.length === 1 ? "y" : "ies"} selected
        </p>
      )}
    </div>
  );
}
