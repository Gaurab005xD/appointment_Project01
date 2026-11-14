"use client";

import FreshOnVisit from "@/components/fresh-on-visit";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { business, formatDuration, getService, policies } from "@/lib/data";
import { formatDate, formatTime, hoursUntil } from "@/lib/schedule";
import {
    appointmentsStore,
    profilesStore,
    sessionStore,
    setAppointmentStatus,
    signOut,
    useClock,
    useHydrated,
    type Appointment,
} from "@/lib/store";
import StatusBadge from "@/components/status-badge";

function AccountPageContent() {
    const router = useRouter();
    const hydrated = useHydrated();
    const session = sessionStore.useValue();
    const appointments = appointmentsStore.useValue();
    const profiles = profilesStore.useValue();
    const clock = useClock();
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    if (!hydrated || !clock || !appointments) {
        return (
            <main className="page-shell flex-1 py-12">
                <div className="h-64 animate-pulse rounded-2xl bg-brand-50" aria-label="Loading your appointments" />
            </main>
        );
    }

    if (!session) {
        return (
            <main className="page-shell flex-1 py-16">
                <div className="panel mx-auto max-w-lg p-8 text-center">
                    <h1 className="font-display text-3xl font-bold">My appointments</h1>
                    <p className="mt-3 text-ink-soft">Sign in to see, cancel or reschedule your appointments.</p>
                    <Link href="/signin" className="primary-button mt-6">Sign in</Link>
                    <p className="mt-4 text-sm text-ink-soft">
                        No account? <Link href="/signup" className="text-link">Create one</Link>
                    </p>
                </div>
            </main>
        );
    }

    if (session.role === "admin") {
        return (
            <main className="page-shell flex-1 py-16">
                <div className="panel mx-auto max-w-lg p-8 text-center">
                    <h1 className="font-display text-3xl font-bold">You&apos;re signed in as the accountant</h1>
                    <Link href="/admin" className="primary-button mt-6">Open the dashboard</Link>
                </div>
            </main>
        );
    }

    const mine = appointments
        .filter((a) => a.clientEmail === session.email)
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

    const isUpcoming = (a: Appointment) =>
        (a.status === "Confirmed" || a.status === "Pending") &&
        hoursUntil(a.date, a.time, clock.today, clock.nowMinutes) > 0;

    const upcoming = mine.filter(isUpcoming);
    const history = mine.filter((a) => !isUpcoming(a)).reverse();
    const profile = profiles?.find((p) => p.email === session.email);

    const cancel = (appointment: Appointment) => {
        setAppointmentStatus(appointment.id, "Cancelled by client", session.name);
        setConfirmingId(null);
        setMessage(
            `Your ${getService(appointment.serviceId)?.name} on ${formatDate(appointment.date)} was cancelled. A confirmation email is on its way.`
        );
    };

    return (
        <main className="flex-1">
            <section className="border-b border-line bg-brand-50">
                <div className="page-shell flex flex-col justify-between gap-6 py-10 md:flex-row md:items-end">
                    <div>
                        <h1 className="font-display text-4xl font-bold tracking-tight">My appointments</h1>
                        <p className="mt-2 text-ink-soft">Signed in as {session.name} ({session.email})</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/booking" className="primary-button w-auto">Book appointment</Link>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {
                                signOut();
                                router.push("/");
                            }}
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </section>

            <div className="page-shell grid gap-10 py-10 lg:grid-cols-[1fr_18rem]">
                <div>
                    <p role="status" className={message ? "mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm font-medium" : "sr-only"}>
                        {message}
                    </p>

                    <h2 className="font-display text-2xl font-bold">Upcoming</h2>
                    {upcoming.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center">
                            <p className="text-ink-soft">You have no upcoming appointments.</p>
                            <Link href="/booking" className="text-link mt-3 inline-block">Book your next appointment</Link>
                        </div>
                    ) : (
                        <ul className="mt-4 space-y-4">
                            {upcoming.map((a) => {
                                const service = getService(a.serviceId);
                                const canChange =
                                    hoursUntil(a.date, a.time, clock.today, clock.nowMinutes) > policies.cancellationHours;
                                return (
                                    <li key={a.id} className="panel p-5 sm:p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="font-display text-xl font-semibold">{service?.name}</p>
                                                <p className="figures mt-1">
                                                    {formatDate(a.date)} at {formatTime(a.time)}
                                                </p>
                                                <p className="mt-1 text-sm text-ink-soft">
                                                    {service && formatDuration(service.duration)} · {service?.location}
                                                </p>
                                            </div>
                                            <StatusBadge status={a.status} />
                                        </div>

                                        <div className="mt-5 border-t border-line pt-4">
                                            {!canChange ? (
                                                <p className="text-sm text-ink-soft">
                                                    This appointment is less than {policies.cancellationHours} hours away. To change it, call{" "}
                                                    <a className="text-link" href={business.phoneHref}>{business.phone}</a>.
                                                </p>
                                            ) : confirmingId === a.id ? (
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <p className="font-semibold">Cancel this appointment?</p>
                                                    <button type="button" onClick={() => cancel(a)} className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
                                                        Yes, cancel it
                                                    </button>
                                                    <button type="button" onClick={() => setConfirmingId(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                                                        Keep appointment
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-3">
                                                    <Link href={`/booking?reschedule=${a.id}`} className="rounded-lg border border-brand-700 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                                                        Reschedule
                                                    </Link>
                                                    <button type="button" onClick={() => setConfirmingId(a.id)} className="rounded-lg px-4 py-2 text-sm font-semibold text-danger hover:bg-red-50">
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <h2 className="mt-12 font-display text-2xl font-bold">Past and cancelled</h2>
                    {history.length === 0 ? (
                        <p className="mt-4 text-ink-soft">Nothing here yet.</p>
                    ) : (
                        <ul className="mt-4 divide-y divide-line border-y border-line">
                            {history.map((a) => (
                                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                    <span>
                                        <span className="font-semibold">{getService(a.serviceId)?.name}</span>
                                        <span className="figures block text-sm text-ink-soft">
                                            {formatDate(a.date, "short")}, {formatTime(a.time)}
                                        </span>
                                    </span>
                                    <StatusBadge status={a.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <aside className="space-y-6">
                    <div className="panel p-5">
                        <h2 className="font-display text-lg font-semibold">Profile</h2>
                        <dl className="mt-3 space-y-2 text-sm">
                            <div><dt className="text-ink-soft">Name</dt><dd className="font-semibold">{session.name}</dd></div>
                            <div><dt className="text-ink-soft">Email</dt><dd className="break-all font-semibold">{session.email}</dd></div>
                            <div><dt className="text-ink-soft">Phone</dt><dd className="font-semibold">{profile?.phone || "Not added"}</dd></div>
                        </dl>
                    </div>
                    <div className="rounded-2xl bg-ink p-5 text-sm leading-6 text-brand-100">
                        <h2 className="font-display text-lg font-semibold text-white">Changing a booking</h2>
                        <p className="mt-2">{policies.cancellationText}</p>
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default function AccountPage() {
    return (
        <FreshOnVisit>
            <AccountPageContent />
        </FreshOnVisit>
    );
}
