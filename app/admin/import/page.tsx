import ImportClient from "@/app/components/import/ImportClient";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Import Destinations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a CSV or Excel file to bulk import destinations.
        </p>
      </div>
      <ImportClient />
    </div>
  );
}