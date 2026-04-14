import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Calendar, Download, RefreshCw, Search, X } from "lucide-react";

interface FacetedFilter {
  /** Column ID to filter on */
  columnId: string;
  /** Label shown on the dropdown trigger */
  label: string;
  /** Options for the dropdown */
  options: { label: string; value: string }[];
}

interface DateRange {
  from: string;
  to: string;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  /** Placeholder for the global search input */
  searchPlaceholder?: string;
  /** Column ID to bind global search to */
  searchColumnId?: string;
  /** Faceted filter definitions */
  facetedFilters?: FacetedFilter[];
  /** Called when CSV export button is clicked */
  onExport?: () => void;
  /** Enable date range filter — pass the column ID that holds the date */
  dateRangeColumnId?: string;
  /** Called when date range changes */
  onDateRangeChange?: (range: DateRange | null) => void;
  /** Called when manual refresh is requested */
  onRefresh?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Buscar...",
  searchColumnId,
  facetedFilters,
  onExport,
  dateRangeColumnId,
  onDateRangeChange,
  onRefresh,
}: DataTableToolbarProps<TData>) {
  const searchColumn = searchColumnId
    ? table.getColumn(searchColumnId)
    : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {searchColumn && (
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={(searchColumn.getFilterValue() as string) ?? ""}
            onChange={(e) => searchColumn.setFilterValue(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      {facetedFilters?.map((filter) => {
        const column = table.getColumn(filter.columnId);
        if (!column) return null;
        const currentValue = (column.getFilterValue() as string) ?? "";
        const hasFilter = !!currentValue;
        return (
          <Select
            key={filter.columnId}
            value={currentValue || "__all__"}
            onValueChange={(value) =>
              column.setFilterValue(value === "__all__" ? undefined : value)
            }
          >
            <SelectTrigger
              className={`h-9 w-[180px] ${hasFilter ? "border-primary" : ""}`}
            >
              <span className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">{filter.label}:</span>
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}

      {dateRangeColumnId && (
        <DateRangeFilter onChange={onDateRangeChange} />
      )}

      {onRefresh && (
        <Button
          variant="outline"
          size="icon-sm"
          className={`h-9 w-9 ${!onExport ? 'ml-auto' : ''}`}
          onClick={onRefresh}
          title="Actualizar datos"
        >
          <RefreshCw className="size-4" />
        </Button>
      )}

      {onExport && (
        <Button
          variant="outline"
          size="sm"
          className={`h-9 ${!onRefresh ? 'ml-auto' : ''}`}
          onClick={onExport}
        >
          <Download className="mr-2 size-4" />
          Exportar CSV
        </Button>
      )}
    </div>
  );
}

function DateRangeFilter({
  onChange,
}: {
  onChange?: (range: DateRange | null) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Calendar className="mr-2 size-4" />
          Fecha
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const from = fd.get("from") as string;
            const to = fd.get("to") as string;
            if (from && to) {
              onChange?.({ from, to });
            }
          }}
        >
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Rango de fechas</h4>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Desde</Label>
                <Input type="date" name="from" className="h-8 text-sm" />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">Hasta</Label>
                <Input type="date" name="to" className="h-8 text-sm" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">
              Aplicar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange?.(null)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
