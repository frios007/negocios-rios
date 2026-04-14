/**
 * Export data to a CSV file and trigger a browser download.
 * Includes a UTF-8 BOM so Excel opens it with correct encoding (ñ, á, é, etc).
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: string[][],
) {
  const escape = (cell: string) =>
    `"${String(cell ?? "").replace(/"/g, '""')}"`;

  const csv = [headers.map(escape).join(",")]
    .concat(rows.map((row) => row.map(escape).join(",")))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
