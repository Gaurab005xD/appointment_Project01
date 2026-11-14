import type { AppointmentStatus } from "@/lib/store";

const styles: Record<AppointmentStatus, string> = {
    Pending: "bg-amber-50 text-amber-800 border-amber-200",
    Confirmed: "bg-brand-50 text-brand-800 border-brand-200",
    Completed: "bg-slate-100 text-slate-700 border-slate-200",
    "Cancelled by client": "bg-red-50 text-red-800 border-red-200",
    "Cancelled by accountant": "bg-red-50 text-red-800 border-red-200",
    Rescheduled: "bg-violet-50 text-violet-800 border-violet-200",
    "No-show": "bg-orange-50 text-orange-800 border-orange-200",
};

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
    return (
        <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
            {status}
        </span>
    );
}
