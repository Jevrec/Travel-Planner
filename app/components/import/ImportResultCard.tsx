// components/admin/import/ImportResultCard.tsx
"use client";

import { CheckCircle, AlertCircle, SkipForward } from "lucide-react";

type ImportResult = {
  success: number;
  skipped: number;
  errors: { row: number; reason: string }[];
};

export default function ImportResultCard({
  result,
  totalRows,
}: {
  result: ImportResult;
  totalRows: number;
}) {
  return (
    <div className="space-y-4">
      {/* Summary kartice */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <CheckCircle size={24} className="mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold text-green-700">{result.success}</p>
          <p className="text-xs text-green-600 mt-1">Imported</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4 text-center">
          <SkipForward size={24} className="mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold text-yellow-700">{result.skipped}</p>
          <p className="text-xs text-yellow-600 mt-1">Skipped (duplicates)</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 text-center">
          <AlertCircle size={24} className="mx-auto mb-2 text-red-500" />
          <p className="text-2xl font-bold text-red-700">
            {result.errors.length}
          </p>
          <p className="text-xs text-red-600 mt-1">Errors</p>
        </div>
      </div>

      {/* Error seznam */}
      {result.errors.length > 0 && (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b bg-red-50">
            <p className="text-sm font-medium text-red-700">Import Errors</p>
          </div>
          <div className="divide-y max-h-48 overflow-y-auto">
            {result.errors.map((err, i) => (
              <div
                key={i}
                className="px-4 py-2 flex items-center gap-3 text-sm"
              >
                <span className="text-gray-400 font-mono text-xs">
                  Row {err.row}
                </span>
                <span className="text-red-600">{err.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.success > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-sm text-green-700 font-medium">
            ✅ Successfully imported {result.success} of {totalRows}{" "}
            destinations!
          </p>
        </div>
      )}
    </div>
  );
}
