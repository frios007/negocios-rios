import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenantKey, getTenantKey } from "@/lib/query/tenant-key";
import { createFileRoute } from "@tanstack/react-router";
import {
  useProducts,
  useCategoryOptions,
  useSupplierOptions,
} from "@/features/products/hooks/useProducts";
import type { Product } from "@/features/products/types/product.types";
import { getProductColumns } from "@/features/products/components/product-columns";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { ProductDeleteConfirm } from "@/features/products/components/product-delete-confirm";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { exportToCsv } from "@/lib/utils/csv-export";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  productsQueryOptions,
  categoryOptionsQueryOptions,
  supplierOptionsQueryOptions,
} from "@/features/products/api/products.queries";

export const Route = createFileRoute("/_auth/_appLayout/products")({
  component: ProductsPage,
  loader: async ({ context: { queryClient } }) => {
    const tenantKey = getTenantKey();
    await Promise.all([
      queryClient.ensureQueryData(productsQueryOptions(tenantKey, 1, 200)),
      queryClient.ensureQueryData(categoryOptionsQueryOptions(tenantKey)),
      queryClient.ensureQueryData(supplierOptionsQueryOptions(tenantKey)),
    ]);
  },
});

function ProductsPage() {
  const queryClient = useQueryClient();
  const tenantKey = useTenantKey();
  const { data } = useProducts(1, 200);
  const { data: categories } = useCategoryOptions();
  const { data: suppliers } = useSupplierOptions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: (p) => {
          setEditingProduct(p);
          setDialogOpen(true);
        },
        onDelete: setDeletingProduct,
      }),
    [],
  );

  const facetedFilters = useMemo(() => {
    const filters = [];
    if (categories?.length) {
      filters.push({
        columnId: "category",
        label: "Categoría",
        options: categories.map((c) => ({ label: c.name, value: c.name })),
      });
    }
    if (suppliers?.length) {
      filters.push({
        columnId: "supplier",
        label: "Proveedor",
        options: suppliers.map((s) => ({ label: s.name, value: s.name })),
      });
    }
    return filters;
  }, [categories, suppliers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Catálogo de productos activos.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Nuevo Producto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        renderToolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchColumnId="name"
            searchPlaceholder="Buscar por nombre..."
            facetedFilters={facetedFilters}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: [...tenantKey, "products"] })}
            onExport={() => {
              const rows = table.getFilteredRowModel().rows.map((r) => {
                const p = r.original;
                return [
                  p.name,
                  p.barcode ?? "",
                  p.category?.name ?? "",
                  p.supplier?.name ?? "",
                  p.costPrice,
                  `${Number(p.profitMargin).toFixed(0)}%`,
                  p.unitPrice,
                  String(p.stockQuantity),
                  p.isRegulated ? "Sí" : "No",
                  p.isSample ? "Sí" : "No",
                ];
              });
              exportToCsv(
                "productos",
                [
                  "Nombre",
                  "Código",
                  "Categoría",
                  "Proveedor",
                  "Costo",
                  "Margen",
                  "Precio Venta",
                  "Stock",
                  "Regulado",
                  "Muestra",
                ],
                rows,
              );
            }}
          />
        )}
      />

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
      />

      <ProductDeleteConfirm
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
      />
    </div>
  );
}
