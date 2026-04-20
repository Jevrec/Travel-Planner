import type { LucideIcon } from "lucide-react";

export default function UserStatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-primary">
          <Icon size={21} />
        </span>
      </div>
    </div>
  );
}
