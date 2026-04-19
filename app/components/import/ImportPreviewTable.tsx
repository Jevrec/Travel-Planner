// components/admin/import/ImportPreviewTable.tsx
"use client";

const COLUMNS = ["name", "country", "city", "pricePerNight", "rating", "tags"];

export default function ImportPreviewTable({
  rows,
  totalRows,
}: {
  rows: Record<string, unknown>[];
  totalRows: number;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Preview (first 10 rows)
        </p>
        {totalRows > 10 && (
          <span className="text-xs text-gray-400">
            +{totalRows - 10} more rows
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">
                #
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-gray-500 font-medium"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                {COLUMNS.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-2 text-gray-700 max-w-32 truncate"
                  >
                    {row[col] !== undefined && row[col] !== null ? (
                      String(row[col])
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
