import { getDestinations } from "@/app/actions/destinations";
import DestinationsClient from "@/components/admin/destinations/DestinationsClient";

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Destinations</h1>
        <p className="text-sm text-gray-500 mt-1">{destinations.length} total destinations</p>
      </div>
      <DestinationsClient initialDestinations={destinations} />
    </div>
  );
}