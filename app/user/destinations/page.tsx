import { getDestinations } from "@/app/actions/destinations";
import DestinationCatalog from "@/app/components/user/DestinationCatalog";

export default async function UserDestinationsPage() {
  const destinations = await getDestinations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Destinations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pick dates, add travelers, and send a booking request.
        </p>
      </div>

      <DestinationCatalog destinations={destinations} />
    </div>
  );
}
