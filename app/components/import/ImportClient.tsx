// components/admin/import/ImportClient.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { importDestinations } from "@/app/actions/import";
import ImportPreviewTable from "./ImportPreviewTable";
import ImportResultCard from "./ImportResultCard";

type ParsedRow = Record<string, any>;

type ImportResult = {
  success: number;
  skipped: number;
  errors: { row: number; reason: string }[];
};

const REQUIRED_COLUMNS = ["name", "country", "city", "pricePerNight"];
const ALL_COLUMNS = [
  "name",
  "country",
  "city",
  "description",
  "pricePerNight",
  "lat",
  "lon",
  "rating",
  "tags",
];

export default function ImportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [columnErrors, setColumnErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");

  const parseFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => handleParsed(res.data as ParsedRow[]),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet) as ParsedRow[];
      handleParsed(data);
    }
  };

  const handleParsed = (data: ParsedRow[]) => {
    if (data.length === 0) return;

    // Normalizacija header imen (lowercase, trim)
    const normalized = data.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([k, v]) => [
          k.trim().toLowerCase().replace(/\s+/g, ""),
          v,
        ]),
      ),
    );

    // Preveri obvezne stolpce
    const headers = Object.keys(normalized[0] || {});
    const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
    setColumnErrors(missing);
    setRows(normalized);
    setStep("preview");
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setColumnErrors([]);
    await parseFile(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (columnErrors.length > 0) return;
    setLoading(true);
    const res = await importDestinations(rows as any);
    setResult(res);
    setStep("done");
    setLoading(false);
  };

  const handleReset = () => {
    setFile(null);
    setRows([]);
    setColumnErrors([]);
    setResult(null);
    setStep("upload");
  };

  return (
    <div className="space-y-6">
      {/* Template download */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet size={20} className="text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Download CSV Template
            </p>
            <p className="text-xs text-blue-500">
              Columns: {ALL_COLUMNS.join(", ")}
            </p>
          </div>
        </div>
        <button
          onClick={() => downloadTemplate()}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition"
        >
          Download Template
        </button>
      </div>

      {/* Upload zona */}
      {step === "upload" && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition
            ${isDragActive ? "border-primary bg-blue-50" : "border-gray-200 hover:border-primary hover:bg-gray-50"}`}
        >
          <input {...getInputProps()} />
          <Upload size={36} className="mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 font-medium">
            {isDragActive
              ? "Drop the file here..."
              : "Drag & drop your file here"}
          </p>
          <p className="text-sm text-gray-400 mt-1">or click to browse</p>
          <p className="text-xs text-gray-300 mt-3">
            Supports: .csv, .xlsx, .xls
          </p>
        </div>
      )}

      {/* Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center justify-between bg-white border rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-green-500" />
              <div>
                <p className="text-sm font-medium">{file?.name}</p>
                <p className="text-xs text-gray-400">
                  {rows.length} rows detected
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Column errors */}
          {columnErrors.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={18} className="text-red-500" />
                <p className="text-sm font-medium text-red-700">
                  Missing required columns:
                </p>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {columnErrors.map((col) => (
                  <li key={col} className="flex items-center gap-2">
                    <span className="font-mono bg-red-100 px-2 py-0.5 rounded">
                      {col}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview tabela */}
          <ImportPreviewTable
            rows={rows.slice(0, 10)}
            totalRows={rows.length}
          />

          {/* Akcije */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading || columnErrors.length > 0}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium
                hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading
                ? `Importing ${rows.length} rows...`
                : `Import ${rows.length} destinations`}
            </button>
          </div>
        </div>
      )}

      {/* Rezultat */}
      {step === "done" && result && (
        <div className="space-y-4">
          <ImportResultCard result={result} totalRows={rows.length} />
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
          >
            Import another file
          </button>
        </div>
      )}
    </div>
  );
}

function downloadTemplate() {
  const headers = [
    "name",
    "country",
    "city",
    "description",
    "pricePerNight",
    "lat",
    "lon",
    "rating",
    "tags",
  ];
  const example = [
    "Paris",
    "France",
    "Paris",
    "The city of lights",
    "120",
    "48.8566",
    "2.3522",
    "4.8",
    "romantic,city,culture",
  ];
  const csv = [headers.join(","), example.join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "destinations-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
