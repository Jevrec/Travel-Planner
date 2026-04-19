"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { importDestinations } from "@/app/actions/import";

type PreviewRow = {
  name: string;
  country: string;
  city: string;
  description: string;
  pricePerNight: number;
  rating: number;
  lat: number;
  lon: number;
  tags: string;
};

type ImportResult = {
  success: number;
  failed: number;
  errors: string[];
};

export default function ImportClient() {
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = (file: File) => {
    setResult(null);
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      setPreview(rows as PreviewRow[]);
    };

    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setLoading(true);
    const res = await importDestinations(preview);
    setResult(res);
    setLoading(false);
    if (res.success > 0) setPreview([]);
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: "Santorini",
        country: "Greece",
        city: "Santorini",
        description: "Beautiful island with white buildings",
        pricePerNight: 120,
        rating: 4.8,
        lat: 36.3932,
        lon: 25.4615,
        tags: "beach, luxury, romantic",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Destinations");
    XLSX.writeFile(wb, "destinations_template.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Download template */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-800">Download Template</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Use this Excel template to prepare your data for import.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
        >
          <Download size={15} /> Template
        </button>
      </div>

      {/* Upload zona */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition
          ${dragOver ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary hover:bg-gray-50"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <FileSpreadsheet size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-700">
          {fileName ? fileName : "Drop your CSV or Excel file here"}
        </p>
        <p className="text-xs text-gray-400 mt-1">or click to browse</p>
        <p className="text-xs text-gray-300 mt-3">.csv, .xlsx, .xls supported</p>
      </div>

      {/* Rezultat uvoza */}
      {result && (
        <div className={`rounded-2xl p-5 border ${result.failed === 0 ? "bg-green-50 border-green-100" : "bg-yellow-50 border-yellow-100"}`}>
          <div className="flex items-center gap-3 mb-2">
            {result.failed === 0
              ? <CheckCircle size={20} className="text-green-600" />
              : <XCircle size={20} className="text-yellow-600" />}
            <p className="font-medium text-gray-800">
              Import complete — {result.success} imported, {result.failed} failed
            </p>
          </div>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.errors.map((e, i) => (
                <li key={i} className="text-xs text-red-600">{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Preview tabela */}
      {preview.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Preview — {preview.length} rows
            </h2>
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-60 transition"
            >
              <Upload size={15} />
              {loading ? "Importing..." : `Import ${preview.length} destinations`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Country</th>
                  <th className="pb-2 font-medium">City</th>
                  <th className="pb-2 font-medium">Price/Night</th>
                  <th className="pb-2 font-medium">Rating</th>
                  <th className="pb-2 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {preview.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 font-medium">{row.name || "—"}</td>
                    <td className="py-2 text-gray-600">{row.country || "—"}</td>
                    <td className="py-2 text-gray-600">{row.city || "—"}</td>
                    <td className="py-2">€{row.pricePerNight || "—"}</td>
                    <td className="py-2">{row.rating || "—"}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {String(row.tags || "").split(",").filter(Boolean).map((tag, j) => (
                          <span key={j} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}