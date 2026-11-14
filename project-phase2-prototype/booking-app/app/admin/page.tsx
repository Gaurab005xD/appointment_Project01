"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
    dayNames,
    formatDuration,
    formatPrice,
    getService,
    holidays,
    policies,
    services,
    workingHours,
} from "@/lib/data";
import { addDays, formatDate, formatTime, fromDateKey, toMinutes, toTime } from "@/lib/schedule";
import {
    addBlockedTime,
    appointmentsStore,
    auditStore,
    blockedStore,
    removeBlockedTime,
    sessionStore,
    setAppointmentStatus,
    signOut,
    statuses,
    useClock,
    useHydrated,
    type Appointment,
    type AppointmentStatus,
} from "@/lib/store";
import StatusBadge from "@/components/status-badge";

const tabs = ["Appointments", "Week", "Clients", "Services", "Availability", "Activity"] as const;
type Tab = (typeof tabs)[number];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const active = (a: Appointment) => a.status === "Confirmed" || a.status === "Pending";

export default function AdminPage() {
    const router = useRouter();
    const hydrated = useHydrated();
    const session = sessionStore.useValue();
    const appointments = appointmentsStore.useValue();
    const clock = useClock();
    const [tab, setTab] = useState<Tab>("Appointments");

    if (!hydrated || !clock || !appointments) {
        return (
            <main className="page-shell flex-1 py-12">
                <div className="h-64 animate-pulse rounded-2xl bg-brand-50" aria-label="Loading dashboard" />
            </main>
        );
    }

    // Role check. In production this is enforced on the server for every
    // admin request; hiding the page in the browser alone is not security.
    if (session?.role !== "admin") {
        return (
            <main className="page-shell flex-1 py-16">
                <div className="panel mx-auto max-w-lg p-8 text-center">
                    <h1 className="font-display text-3xl font-bold">Accountant access only</h1>
                    <p className="mt-3 text-ink-soft">
                        This dashboard is for the accountant. Sign in with an administrator account to continue.
                    </p>
                    <Link href="/signin" className="primary-button mt-6">Sign in</Link>
                </div>
            </main>
        );
    }

    const todays = appointments
        .filter((a) => a.date === clock.today && a.status !== "Rescheduled")
        .sort((a, b) => a.time.localeCompare(b.time));
    const upcoming = appointments
        .filter((a) => a.date > clock.today && active(a))
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    const weekEnd = addDays(clock.today, 7);
    const thisWeek = appointments.filter((a) => active(a) && a.date >= clock.today && a.date < weekEnd);
    const expected = thisWeek.reduce((sum, a) => sum + (getService(a.serviceId)?.price ?? 0), 0);
    const recentCancellations = appointments.filter((a) => a.status.startsWith("Cancelled")).length;

    return (
        <main className="flex-1 bg-brand-50/40">
            <section className="border-b border-line bg-ink text-white">
                <div className="page-shell flex flex-col justify-between gap-4 py-8 md:flex-row md:items-end">
                    <div>
                        <p className="text-brand-200">Accountant dashboard</p>
                        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
                            Good day, {session.name.split(" ")[0]}
                        </h1>
                        <p className="figures mt-1 text-brand-100/80">{formatDate(clock.today)}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/booking" className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-ink hover:bg-brand-300">
                            New booking
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                signOut();
                                router.push("/");
                            }}
                            className="rounded-lg border border-white/30 px-4 py-2.5 font-semibold hover:bg-white/10"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                <dl className="page-shell figures grid grid-cols-2 gap-px pb-8 md:grid-cols-4">
                    {[
                        ["Today", plural(todays.filter(active).length, "appointment")],
                        ["Next 7 days", `${thisWeek.length} booked`],
                        ["Expected this week", new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(expected)],
                        ["Cancellations", `${recentCancellations} total`],
                    ].map(([label, value]) => (
                        <div key={label} className="border-l-2 border-brand py-1 pl-4">
                            <dt className="text-sm text-brand-100/80">{label}</dt>
                            <dd className="font-display text-xl font-semibold">{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <div className="page-shell py-8">
                <div role="tablist" aria-label="Dashboard sections" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1">
                    {tabs.map((t) => (
                        <button
                            key={t}
                            type="button"
                            role="tab"
                            id={`tab-${t}`}
                            aria-selected={tab === t}
                            aria-controls={`panel-${t}`}
                            onClick={() => setTab(t)}
                            className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-white aria-selected:bg-white aria-selected:text-ink aria-selected:shadow-sm aria-selected:ring-1 aria-selected:ring-line"
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
                    {tab === "Appointments" && (
                        <div className="grid gap-8 lg:grid-cols-2">
                            <AppointmentList title="Today" items={todays} actor={session.name} empty="No appointments today." />
                            <AppointmentList title="Upcoming" items={upcoming.slice(0, 12)} actor={session.name} empty="Nothing booked yet." showDate />
                        </div>
                    )}
                    {tab === "Week" && <WeekView today={clock.today} appointments={appointments} />}
                    {tab === "Clients" && <Clients appointments={appointments} />}
                    {tab === "Services" && <ServicesTable />}
                    {tab === "Availability" && <Availability actor={session.name} today={clock.today} />}
                    {tab === "Activity" && <Activity />}
                </div>
            </div>
        </main>
    );
}

function AppointmentList({
    title,
    items,
    actor,
    empty,
    showDate = false,
}: {
    title: string;
    items: Appointment[];
    actor: string;
    empty: string;
    showDate?: boolean;
}) {
    return (
        <section className="panel p-5">
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            {items.length === 0 ? (
                <p className="mt-4 text-ink-soft">{empty}</p>
            ) : (
                <ul className="mt-3 divide-y divide-line">
                    {items.map((a) => {
                        const service = getService(a.serviceId);
                        return (
                            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                <div className="min-w-0">
                                    <p className="figures text-sm font-semibold text-brand-700">
                                        {showDate && `${formatDate(a.date, "short")}, `}
                                        {formatTime(a.time)}
                                        {service && ` – ${formatTime(toTime(toMinutes(a.time) + service.duration))}`}
                                    </p>
                                    <p className="font-semibold">{a.clientName}</p>
                                    <p className="text-sm text-ink-soft">{service?.name}</p>
                                </div>
                                <div>
                                    <label htmlFor={`status-${a.id}`} className="sr-only">
                                        Status for {a.clientName}
                                    </label>
                                    <select
                                        id={`status-${a.id}`}
                                        value={a.status}
                                        onChange={(e) => setAppointmentStatus(a.id, e.target.value as AppointmentStatus, actor)}
                                        className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm font-medium"
                                    >
                                        {statuses.filter((s) => s !== "Rescheduled").map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

function WeekView({ today, appointments }: { today: string; appointments: Appointment[] }) {
    const [offset, setOffset] = useState(0);
    // Week starts on Monday
    const day = fromDateKey(today).getDay();
    const monday = addDays(today, -((day + 6) % 7) + offset * 7);
    const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

    return (
        <section className="panel p-5">
            <div className="flex items-center justify-between gap-3">
                <h2 className="figures font-display text-xl font-semibold">
                    Week of {formatDate(monday, "short")}
                </h2>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setOffset((o) => o - 1)} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold">Previous</button>
                    <button type="button" onClick={() => setOffset(0)} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold">This week</button>
                    <button type="button" onClick={() => setOffset((o) => o + 1)} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold">Next</button>
                </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-7">
                {days.map((d) => {
                    const items = appointments
                        .filter((a) => a.date === d && a.status !== "Rescheduled")
                        .sort((a, b) => a.time.localeCompare(b.time));
                    const closed = holidays[d] || (workingHours[fromDateKey(d).getDay()] ?? []).length === 0;
                    return (
                        <div key={d} className={`min-h-32 rounded-xl border p-3 ${d === today ? "border-brand bg-brand-50" : "border-line"}`}>
                            <p className="figures text-sm font-semibold">{formatDate(d, "short").replace(/,.*/, "")}</p>
                            <p className="figures text-xs text-ink-soft">{fromDateKey(d).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</p>
                            {closed && <p className="mt-2 text-xs text-ink-soft">{holidays[d] ?? "Closed"}</p>}
                            <ul className="mt-2 space-y-1.5">
                                {items.map((a) => (
                                    <li key={a.id} className={`rounded-md px-2 py-1 text-xs ${active(a) ? "bg-brand-700 text-white" : a.status === "Completed" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-800 line-through"}`}
                                        title={a.status}>
                                        <span className="figures font-semibold">{formatTime(a.time)}</span>
                                        <span className="block truncate">{a.clientName}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function Clients({ appointments }: { appointments: Appointment[] }) {
    const [query, setQuery] = useState("");
    const clients = useMemo(() => {
        const map = new Map<string, { name: string; email: string; phone?: string; items: Appointment[] }>();
        for (const a of appointments) {
            const entry = map.get(a.clientEmail) ?? { name: a.clientName, email: a.clientEmail, phone: a.clientPhone, items: [] };
            entry.items.push(a);
            map.set(a.clientEmail, entry);
        }
        return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    }, [appointments]);
    const q = query.trim().toLowerCase();
    const filtered = q ? clients.filter((c) => c.name.toLowerCase().includes(q) || c.email.includes(q)) : clients;

    return (
        <section className="panel p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h2 className="font-display text-xl font-semibold">Clients</h2>
                <div className="sm:w-72">
                    <label htmlFor="client-search" className="sr-only">Search clients</label>
                    <input id="client-search" type="search" placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} className="form-input" />
                </div>
            </div>
            <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead className="border-b border-line text-ink-soft">
                        <tr>
                            <th scope="col" className="py-2 font-semibold">Client</th>
                            <th scope="col" className="py-2 font-semibold">Email</th>
                            <th scope="col" className="py-2 font-semibold">Appointments</th>
                            <th scope="col" className="py-2 font-semibold">Latest</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {filtered.map((c) => {
                            const latest = [...c.items].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))[0];
                            return (
                                <tr key={c.email}>
                                    <td className="py-3 font-semibold">{c.name}</td>
                                    <td className="py-3">{c.email}</td>
                                    <td className="figures py-3">{c.items.length}</td>
                                    <td className="py-3">
                                        <span className="figures mr-2">{formatDate(latest.date, "short")}</span>
                                        <StatusBadge status={latest.status} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && <p className="py-6 text-center text-ink-soft">No clients match &ldquo;{query}&rdquo;.</p>}
            </div>
        </section>
    );
}

function ServicesTable() {
    return (
        <section className="panel p-5">
            <h2 className="font-display text-xl font-semibold">Services</h2>
            <p className="mt-1 text-sm text-ink-soft">Editing services is planned for the next phase. Changes here will update the public site.</p>
            <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                    <thead className="border-b border-line text-ink-soft">
                        <tr>
                            {["Service", "Length", "Buffer", "Price", "Format", "Status"].map((h) => (
                                <th key={h} scope="col" className="py-2 font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="figures divide-y divide-line">
                        {services.map((s) => (
                            <tr key={s.id}>
                                <td className="py-3 font-semibold">{s.name}</td>
                                <td className="py-3">{formatDuration(s.duration)}</td>
                                <td className="py-3">{s.buffer ? `${s.buffer} min` : "None"}</td>
                                <td className="py-3">{formatPrice(s)}</td>
                                <td className="py-3">{s.mode}</td>
                                <td className="py-3">{s.active ? "Active" : "Hidden"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <dl className="mt-6 grid gap-4 border-t border-line pt-4 text-sm sm:grid-cols-3">
                <div><dt className="text-ink-soft">Booking window</dt><dd className="font-semibold">{policies.bookingWindowDays} days ahead</dd></div>
                <div><dt className="text-ink-soft">Minimum notice</dt><dd className="font-semibold">{policies.minimumNoticeMinutes / 60} hours</dd></div>
                <div><dt className="text-ink-soft">Online changes until</dt><dd className="font-semibold">{policies.cancellationHours} hours before</dd></div>
            </dl>
        </section>
    );
}

function Availability({ actor, today }: { actor: string; today: string }) {
    const blocked = blockedStore.useValue() ?? [];
    const [form, setForm] = useState({ date: "", start: "12:00", end: "13:00", reason: "" });
    const [error, setError] = useState("");

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!form.date) return setError("Choose a date to block.");
        if (form.date < today) return setError("Choose today or a future date.");
        if (form.end <= form.start) return setError("The end time must be after the start time.");
        if (!form.reason.trim()) return setError("Add a reason, like Meeting or Vacation.");
        setError("");
        addBlockedTime({ ...form, reason: form.reason.trim() }, actor);
        setForm({ date: "", start: "12:00", end: "13:00", reason: "" });
    };

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section className="panel p-5">
                <h2 className="font-display text-xl font-semibold">Working hours</h2>
                <p className="mt-1 text-sm text-ink-soft">Gaps between periods (like lunch) are never offered to clients.</p>
                <dl className="figures mt-4 divide-y divide-line text-sm">
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                        <div key={d} className="flex justify-between gap-4 py-2.5">
                            <dt className="font-semibold">{dayNames[d]}</dt>
                            <dd className="text-right">
                                {workingHours[d].length === 0
                                    ? "Closed"
                                    : workingHours[d].map((p) => `${formatTime(toTime(p.start))} – ${formatTime(toTime(p.end))}`).join(", ")}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="panel p-5">
                <h2 className="font-display text-xl font-semibold">Blocked time</h2>
                <p className="mt-1 text-sm text-ink-soft">Meetings, vacations and other times clients can&apos;t book.</p>
                <form noValidate onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="block-date" className="form-label">Date</label>
                        <input id="block-date" type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="form-input" />
                    </div>
                    <div>
                        <label htmlFor="block-start" className="form-label">From</label>
                        <input id="block-start" type="time" step={1800} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="form-input" />
                    </div>
                    <div>
                        <label htmlFor="block-end" className="form-label">To</label>
                        <input id="block-end" type="time" step={1800} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="form-input" />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="block-reason" className="form-label">Reason</label>
                        <input id="block-reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Meeting, vacation, training…" className="form-input" />
                    </div>
                    {error && <p role="alert" className="form-error sm:col-span-2">{error}</p>}
                    <button type="submit" className="primary-button sm:col-span-2">Block this time</button>
                </form>

                <ul className="mt-6 divide-y divide-line border-t border-line">
                    {blocked.length === 0 && <li className="py-3 text-sm text-ink-soft">No blocked times.</li>}
                    {[...blocked].sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)).map((b) => (
                        <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                            <span>
                                <span className="figures font-semibold">{formatDate(b.date, "short")}, {formatTime(b.start)} – {formatTime(b.end)}</span>
                                <span className="block text-ink-soft">{b.reason}</span>
                            </span>
                            <button type="button" onClick={() => removeBlockedTime(b.id, actor)} className="rounded-md px-3 py-1.5 font-semibold text-danger hover:bg-red-50">
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

function Activity() {
    const entries = auditStore.useValue() ?? [];
    return (
        <section className="panel p-5">
            <h2 className="font-display text-xl font-semibold">Activity log</h2>
            <p className="mt-1 text-sm text-ink-soft">Bookings, cancellations and status changes are recorded for audit.</p>
            {entries.length === 0 ? (
                <p className="mt-4 text-ink-soft">No activity recorded yet.</p>
            ) : (
                <ol className="mt-4 divide-y divide-line">
                    {entries.map((e) => (
                        <li key={e.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[11rem_9rem_1fr]">
                            <time dateTime={e.at} className="figures text-ink-soft">
                                {new Date(e.at).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </time>
                            <span className="font-semibold">{e.actor}</span>
                            <span>{e.action}</span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
