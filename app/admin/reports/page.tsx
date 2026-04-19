import { getReportsData } from "@/app/actions/reports";
import ReportsClient from "@/app/components/admin/reports/ReportsClient";

export default async function ReportsPage() {
  const data = await getReportsData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your business performance.</p>
      </div>
      <ReportsClient data={data} />
    </div>
  );
}