import { useMemo } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./button.jsx";

function getPageNumbers(currentPage, totalPages, maxVisible = 5) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= half + 1) {
    start = 2;
    end = Math.min(totalPages - 1, maxVisible - 1);
  } else if (currentPage >= totalPages - half) {
    start = Math.max(2, totalPages - (maxVisible - 2));
    end = totalPages - 1;
  }

  pages.push(1);
  if (start > 2) pages.push("ellipsis-start");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("ellipsis-end");
  pages.push(totalPages);

  return pages;
}

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = null,
  onPageChange,
  disabled = false,
  className = "",
}) {
  const page = Math.max(1, Number(currentPage) || 1);
  const pages = Math.max(1, Number(totalPages) || 1);

  const pageNumbers = useMemo(() => getPageNumbers(page, pages), [page, pages]);

  if (pages <= 1 && !totalItems) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-brand-amber/10 ${className}`}
    >
      <div className="text-xs text-muted-foreground">
        {totalItems != null ? (
          <>
            Showing page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{pages}</span> (
            <span className="font-semibold text-foreground">{totalItems}</span> total)
          </>
        ) : (
          <>
            Page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{pages}</span>
          </>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || disabled}
            className="h-8 gap-1 px-2.5 text-xs"
          >
            <ChevronLeft className="size-3.5" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((p, idx) => {
              if (typeof p === "string") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex size-8 items-center justify-center text-muted-foreground"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </span>
                );
              }

              const isCurrent = p === page;
              return (
                <Button
                  key={p}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  disabled={disabled}
                  className={`size-8 p-0 text-xs font-semibold ${
                    isCurrent ? "bg-black text-[#fdd835]" : ""
                  }`}
                >
                  {p}
                </Button>
              );
            })}
          </div>

          <span className="sm:hidden px-2 text-xs font-semibold">
            {page} / {pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages || disabled}
            className="h-8 gap-1 px-2.5 text-xs"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default Pagination;

