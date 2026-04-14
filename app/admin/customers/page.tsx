import { getCustomers } from "@/app/actions/customers";
import CustomersClient from "@/app/components/admin/customers/CustomersClient";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">{customers.length} registered customers</p>
      </div>
      <CustomersClient initialCustomers={customers} />
    </div>
  );
}