"use client";

import FreshOnVisit from "@/components/fresh-on-visit";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    activeServices,
    business,
    formatDuration,
    formatPrice,
    getService,
    holidays,
    policies,
    type Service,
} from "@/lib/data";
import {
    addDays,
    availableSlots,
    formatDate,
    formatTime,
    fromDateKey,
    toDateKey,
} from "@/lib/schedule";
import {
    appointmentsStore,
    blockedStore,
    createAppointment,
    profilesStore,
    sessionStore,
    SlotTakenError,
    useClock,
    type Appointment,
} from "@/lib/store";

// ---------------------------------------------------------------
// Client details validation
// ---------------------------------------------------------------
const detailsSchema = z.object({
    name: z.string().trim().min(2, "Enter your full name."),
    email: z.email("Enter a valid email address, like name@example.com."),
    phone: z
        .string()
        .trim()
        .refine(
            (value) => value === "" || value.replace(/\D/g, "").length >= 10,
            "Enter a 10-digit phone number, or leave it blank."
        ),
    notes: z.string().trim().max(500, "Keep notes to 500 characters or fewer."),
});

type Details = z.infer<typeof detailsSchema>;

type Step = 1 | 2 | 3 | 4;

const stepNames = ["Service", "Date and time", "Your details", "Review"];

const isDateKey = (value: string | null): value is string =>
    !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
const isTime = (value: string | null): value is string => !!value && /^\d{2}:\d{2}$/.test(value);

function BookingFlowContent() {
    const params = useSearchParams();
    const session = sessionStore.useValue();
    const appointments = appointmentsStore.useValue();
    const blocked = blockedStore.useValue();
    const profiles = profilesStore.useValue();
    const clock = useClock();

    const rescheduleId = params.get("reschedule");
    const original = rescheduleId ? appointments?.find((a) => a.id === rescheduleId) : undefined;

    // Initial values from the URL (e.g. a "Book this time" link on the home page)
    const [serviceId, setServiceId] = useState<string | null>(() => {
        const fromUrl = params.get("service");
        return getService(fromUrl)?.active ? fromUrl : null;
    });
    const [date, setDate] = useState<string | null>(() => {
        const value = params.get("date");
        return isDateKey(value) ? value : null;
    });
    const [time, setTime] = useState<string | null>(() => {
        const value = params.get("time");
        return isTime(value) ? value : null;
    });
    const [step, setStep] = useState<Step>(() =>
        params.get("reschedule") || getService(params.get("service")) ? 2 : 1
    );
    const [details, setDetails] = useState<Details | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [agreeError, setAgreeError] = useState(false);
    const [slotError, setSlotError] = useState("");
    const [confirmed, setConfirmed] = useState<Appointment | null>(null);

    // Reschedule: service and client come from the original appointment
    const effectiveServiceId = original?.serviceId ?? serviceId;
    const service = getService(effectiveServiceId);
    const effectiveDetails: Details | null = original
        ? {
              name: original.clientName,
              email: original.clientEmail,
              phone: original.clientPhone ?? "",
              notes: original.notes,
          }
        : details;

    // Move focus to the step heading whenever the step changes (screen readers, keyboard users)
    const headingRef = useRef<HTMLHeadingElement>(null);
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        headingRef.current?.focus();
    }, [step, confirmed]);

    const ready = clock && appointments && blocked;

    // Free times for the chosen service and day
    const slots = useMemo(() => {
        if (!ready || !service || !date) return [];
        return availableSlots({
            service,
            date,
            today: clock.today,
            nowMinutes: clock.nowMinutes,
            appointments,
            blocked,
            ignoreAppointmentId: original?.id,
        });
    }, [ready, service, date, clock, appointments, blocked, original?.id]);

    // A time from the URL or an earlier choice may no longer be free
    const timeStillFree = !!time && slots.includes(time);

    if (rescheduleId && appointments && !original) {
        return (
            <Notice title="We couldn't find that appointment">
                It may have been cancelled already. <Link href="/account" className="text-link">Go to My appointments</Link>
            </Notice>
        );
    }

    if (original && (!session || (session.role !== "admin" && session.email !== original.clientEmail))) {
        return (
            <Notice title="This appointment belongs to another account">
                Sign in with the email used to book it. <Link href="/signin" className="text-link">Sign in</Link>
            </Notice>
        );
    }

    // -----------------------------------------------------------
    // Confirmation
    // -----------------------------------------------------------
    if (confirmed) {
        const s = getService(confirmed.serviceId)!;
        return (
            <section className="panel overflow-hidden" role="status">
                <div className="bg-ink px-6 py-8 text-white sm:px-10">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-brand text-ink">
                        <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden="true">
                            <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 ref={headingRef} tabIndex={-1} className="mt-4 font-display text-3xl font-bold outline-none">
                        {original ? "Appointment rescheduled" : "You're booked"}
                    </h1>
                    <p className="mt-2 text-brand-100">
                        A confirmation has been sent to {confirmed.clientEmail}. (Prototype: no email is sent.)
                    </p>
                </div>
                <div className="px-6 py-8 sm:px-10">
                    <Summary service={s} date={confirmed.date} time={confirmed.time} details={{
                        name: confirmed.clientName, email: confirmed.clientEmail, phone: confirmed.clientPhone ?? "", notes: confirmed.notes,
                    }} />
                    <p className="figures mt-6 text-sm text-ink-soft">
                        Booking reference <strong className="text-ink">{confirmed.id.toUpperCase()}</strong>
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        {session ? (
                            <Link href="/account" className="primary-button sm:w-auto">View my appointments</Link>
                        ) : (
                            <Link href="/signup" className="primary-button sm:w-auto">Create an account to manage it</Link>
                        )}
                        <Link href="/" className="secondary-button">Back to home</Link>
                    </div>
                </div>
            </section>
        );
    }

    const goTo = (next: Step) => {
        setSlotError("");
        setStep(next);
    };

    const confirm = () => {
        if (!service || !date || !time || !effectiveDetails) return;
        if (!agreed) {
            setAgreeError(true);
            return;
        }
        try {
            const appointment = createAppointment(
                {
                    serviceId: service.id,
                    date,
                    time,
                    clientName: effectiveDetails.name,
                    clientEmail: effectiveDetails.email.toLowerCase(),
                    clientPhone: effectiveDetails.phone || undefined,
                    notes: effectiveDetails.notes,
                },
                { replaceId: original?.id }
            );
            setConfirmed(appointment);
        } catch (error) {
            setTime(null);
            setSlotError(
                error instanceof SlotTakenError ? error.message : "Something went wrong saving the booking. Please try again."
            );
            setStep(2);
        }
    };

    // Steps shown in the progress bar (reschedule skips service and details)
    const visibleSteps: Step[] = original ? [2, 4] : [1, 2, 3, 4];
    const canOpen = (s: Step) =>
        s === 1 || (s === 2 && !!service) || (s === 3 && !!service && timeStillFree) || (s === 4 && !!effectiveDetails && timeStillFree);

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-4xl font-bold tracking-tight">
                    {original ? "Reschedule appointment" : "Book an appointment"}
                </h1>
                {original && (
                    <p className="mt-2 text-ink-soft">
                        Currently booked: {getService(original.serviceId)?.name}, {formatDate(original.date)} at {formatTime(original.time)}
                    </p>
                )}
            </div>

            <nav aria-label="Booking progress" className="mb-6">
                <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${visibleSteps.length}, minmax(0, 1fr))` }}>
                    {visibleSteps.map((s, index) => {
                        const current = s === step;
                        const done = s < step;
                        return (
                            <li key={s}>
                                <button
                                    type="button"
                                    disabled={!canOpen(s) || current}
                                    onClick={() => goTo(s)}
                                    aria-current={current ? "step" : undefined}
                                    className={`w-full border-t-4 pt-2 text-left text-sm font-semibold transition disabled:cursor-default ${
                                        current ? "border-brand text-ink" : done ? "border-brand-600 text-brand-700 hover:text-brand-800" : "border-line text-ink-soft"
                                    }`}
                                >
                                    <span className="block text-xs font-medium">Step {index + 1}</span>
                                    <span className="hidden sm:inline">{stepNames[s - 1]}</span>
                                    {done && <span className="sr-only"> (completed)</span>}
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </nav>

            <section className="panel p-5 sm:p-8">
                {/* Step 1: service */}
                {step === 1 && (
                    <fieldset>
                        <legend>
                            <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold outline-none">
                                Choose a service
                            </h2>
                        </legend>
                        <div className="mt-5 grid gap-3">
                            {activeServices.map((s) => (
                                <label
                                    key={s.id}
                                    className="flex cursor-pointer items-start gap-4 rounded-xl border border-line p-4 transition hover:border-brand-600 has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-200"
                                >
                                    <input
                                        type="radio"
                                        name="service"
                                        value={s.id}
                                        checked={serviceId === s.id}
                                        onChange={() => {
                                            setServiceId(s.id);
                                            // A different length can make the chosen time invalid
                                            setTime(null);
                                        }}
                                        className="mt-1 h-4 w-4 accent-brand-700"
                                    />
                                    <span className="flex-1">
                                        <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                                            <span className="font-display text-lg font-semibold">{s.name}</span>
                                            <span className="figures font-semibold">{formatPrice(s)}</span>
                                        </span>
                                        <span className="block text-sm text-ink-soft">{s.summary}</span>
                                        <span className="figures mt-1 block text-sm text-ink-soft">
                                            {formatDuration(s.duration)} · {s.mode}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                        <StepActions>
                            <span />
                            <button type="button" className="primary-button sm:w-auto" disabled={!serviceId} onClick={() => goTo(2)}>
                                Continue to date and time
                            </button>
                        </StepActions>
                    </fieldset>
                )}

                {/* Step 2: date and time */}
                {step === 2 && service && (
                    <div>
                        <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold outline-none">
                            Pick a date and time
                        </h2>
                        <p className="figures mt-1 text-ink-soft">
                            {service.name} · {formatDuration(service.duration)} · times in Mountain time
                        </p>

                        {slotError && (
                            <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-danger">
                                {slotError}
                            </p>
                        )}

                        {!ready ? (
                            <div className="mt-6 h-72 animate-pulse rounded-xl bg-brand-50" />
                        ) : (
                            <div className="mt-6 grid gap-8 md:grid-cols-[1.1fr_1fr]">
                                <Calendar
                                    service={service}
                                    today={clock.today}
                                    nowMinutes={clock.nowMinutes}
                                    appointments={appointments}
                                    blocked={blocked}
                                    ignoreId={original?.id}
                                    selected={date}
                                    onSelect={(d) => {
                                        setDate(d);
                                        setTime(null);
                                        setSlotError("");
                                    }}
                                />

                                <div>
                                    <h3 className="font-semibold" id="times-heading">
                                        {date ? formatDate(date) : "Choose a day to see times"}
                                    </h3>
                                    {date && slots.length === 0 && (
                                        <p className="mt-3 text-sm text-ink-soft">
                                            {holidays[date] ? `Closed for ${holidays[date]}.` : "No open times on this day."} Try another date.
                                        </p>
                                    )}
                                    {date && slots.length > 0 && (
                                        <div role="group" aria-labelledby="times-heading" className="figures mt-3 grid grid-cols-3 gap-2">
                                            {slots.map((slot) => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    aria-pressed={time === slot}
                                                    onClick={() => setTime(slot)}
                                                    className="rounded-lg border border-line bg-white px-2 py-2.5 text-sm font-semibold transition hover:border-brand-600 aria-pressed:border-brand-700 aria-pressed:bg-brand-700 aria-pressed:text-white"
                                                >
                                                    {formatTime(slot)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {time && date && !timeStillFree && slots.length > 0 && (
                                        <p role="alert" className="mt-3 text-sm font-medium text-danger">
                                            {formatTime(time)} is no longer available. Please pick another time.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <StepActions>
                            {original ? (
                                <Link href="/account" className="secondary-button">Keep current time</Link>
                            ) : (
                                <button type="button" className="secondary-button" onClick={() => goTo(1)}>Back</button>
                            )}
                            <button
                                type="button"
                                className="primary-button sm:w-auto"
                                disabled={!timeStillFree}
                                onClick={() => goTo(original ? 4 : 3)}
                            >
                                {original ? "Review new time" : "Continue to your details"}
                            </button>
                        </StepActions>
                    </div>
                )}

                {/* Step 3: client details */}
                {step === 3 && (
                    <DetailsForm
                        headingRef={headingRef}
                        initial={
                            details ?? {
                                name: session?.role === "client" ? session.name : "",
                                email: session?.role === "client" ? session.email : "",
                                phone: profiles?.find((p) => p.email === session?.email)?.phone ?? "",
                                notes: "",
                            }
                        }
                        signedIn={session?.role === "client"}
                        onBack={(values) => {
                            setDetails(values);
                            goTo(2);
                        }}
                        onSubmit={(values) => {
                            setDetails(values);
                            goTo(4);
                        }}
                    />
                )}

                {/* Step 4: review */}
                {step === 4 && service && date && time && effectiveDetails && (
                    <div>
                        <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold outline-none">
                            Review and confirm
                        </h2>
                        <div className="mt-6">
                            <Summary service={service} date={date} time={time} details={effectiveDetails} />
                        </div>

                        <div className="mt-6 rounded-xl bg-brand-50 p-5 text-sm leading-6">
                            <h3 className="font-semibold">Cancellation policy</h3>
                            <p className="mt-1 text-ink-soft">{policies.cancellationText}</p>
                            <p className="mt-2 text-ink-soft">{policies.documentsText}</p>
                        </div>

                        <div className="mt-5">
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(event) => {
                                        setAgreed(event.target.checked);
                                        setAgreeError(false);
                                    }}
                                    aria-invalid={agreeError}
                                    aria-describedby={agreeError ? "agree-error" : undefined}
                                    className="mt-1 h-4 w-4 accent-brand-700"
                                />
                                <span>I have read the cancellation policy and agree to it.</span>
                            </label>
                            {agreeError && (
                                <p id="agree-error" role="alert" className="form-error">
                                    Please agree to the cancellation policy to confirm.
                                </p>
                            )}
                        </div>

                        <StepActions>
                            <button type="button" className="secondary-button" onClick={() => goTo(original ? 2 : 3)}>
                                Back
                            </button>
                            <button type="button" className="primary-button sm:w-auto" onClick={confirm}>
                                {original ? "Confirm new time" : "Confirm booking"}
                            </button>
                        </StepActions>
                    </div>
                )}
            </section>

            <p className="mt-6 text-center text-sm text-ink-soft">
                Prefer to book by phone? Call <a className="text-link" href={business.phoneHref}>{business.phone}</a>.
            </p>
        </div>
    );
}

// ---------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="panel p-8">
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            <p className="mt-3 text-ink-soft">{children}</p>
        </section>
    );
}

function StepActions({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            {children}
        </div>
    );
}

function Summary({
    service,
    date,
    time,
    details,
}: {
    service: Service;
    date: string;
    time: string;
    details: Details;
}) {
    const rows: [string, string][] = [
        ["Service", `${service.name} (${formatDuration(service.duration)})`],
        ["Date", formatDate(date)],
        ["Time", `${formatTime(time)} Mountain time`],
        ["Where", service.location ?? service.mode],
        ["Price", `${formatPrice(service)}, paid at the appointment`],
        ["Name", details.name],
        ["Email", details.email],
        ["Phone", details.phone || "Not provided"],
        ["Notes", details.notes || "None"],
    ];
    return (
        <dl className="divide-y divide-line border-y border-line">
            {rows.map(([label, value]) => (
                <div key={label} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
                    <dt className="text-sm text-ink-soft">{label}</dt>
                    <dd className="figures break-words font-medium">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar({
    service,
    today,
    nowMinutes,
    appointments,
    blocked,
    ignoreId,
    selected,
    onSelect,
}: {
    service: Service;
    today: string;
    nowMinutes: number;
    appointments: Appointment[];
    blocked: Parameters<typeof availableSlots>[0]["blocked"];
    ignoreId?: string;
    selected: string | null;
    onSelect: (date: string) => void;
}) {
    const [monthChoice, setMonthChoice] = useState<string | null>(null);
    const month = monthChoice ?? (selected ?? today).slice(0, 7);
    const firstMonth = today.slice(0, 7);
    const lastMonth = addDays(today, policies.bookingWindowDays).slice(0, 7);

    const first = fromDateKey(`${month}-01`);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const leading = first.getDay();

    const shiftMonth = (delta: number) => {
        const d = new Date(first.getFullYear(), first.getMonth() + delta, 1);
        setMonthChoice(toDateKey(d).slice(0, 7));
    };

    // React Compiler memoizes this automatically
    const days = Array.from({ length: daysInMonth }, (_, i) => {
            const key = `${month}-${String(i + 1).padStart(2, "0")}`;
            const count = availableSlots({
                service,
                date: key,
                today,
                nowMinutes,
                appointments,
                blocked,
                ignoreAppointmentId: ignoreId,
            }).length;
            return { key, day: i + 1, count };
        });

    const monthLabel = first.toLocaleDateString("en-CA", { month: "long", year: "numeric" });

    return (
        <div>
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    disabled={month <= firstMonth}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-line disabled:opacity-40"
                    aria-label="Previous month"
                >
                    <span aria-hidden="true">‹</span>
                </button>
                <p className="font-display text-lg font-semibold" aria-live="polite">{monthLabel}</p>
                <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    disabled={month >= lastMonth}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-line disabled:opacity-40"
                    aria-label="Next month"
                >
                    <span aria-hidden="true">›</span>
                </button>
            </div>

            <div className="figures mt-4 grid grid-cols-7 gap-1 text-center" role="grid" aria-label={`Available days in ${monthLabel}`}>
                {weekdayLabels.map((label) => (
                    <div key={label} role="columnheader" className="pb-1 text-xs font-semibold text-ink-soft">
                        {label}
                    </div>
                ))}
                {Array.from({ length: leading }, (_, i) => (
                    <div key={`blank-${i}`} aria-hidden="true" />
                ))}
                {days.map(({ key, day, count }) => {
                    const isSelected = key === selected;
                    const isToday = key === today;
                    const available = count > 0;
                    return (
                        <button
                            key={key}
                            type="button"
                            role="gridcell"
                            disabled={!available}
                            aria-selected={isSelected}
                            aria-label={`${formatDate(key)}, ${available ? `${count} times open` : "no times open"}`}
                            onClick={() => onSelect(key)}
                            className={`relative aspect-square rounded-lg text-sm font-semibold transition ${
                                isSelected
                                    ? "bg-brand-700 text-white"
                                    : available
                                      ? "bg-brand-50 text-ink hover:bg-brand-100"
                                      : "text-ink-soft/50"
                            } ${isToday && !isSelected ? "ring-2 ring-inset ring-brand" : ""}`}
                        >
                            {day}
                            {available && !isSelected && (
                                <span aria-hidden="true" className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-600" />
                            )}
                        </button>
                    );
                })}
            </div>
            <p className="mt-3 text-xs text-ink-soft">Shaded days have open times. Bookings open {policies.bookingWindowDays} days ahead.</p>
        </div>
    );
}

function DetailsForm({
    headingRef,
    initial,
    signedIn,
    onBack,
    onSubmit,
}: {
    headingRef: React.RefObject<HTMLHeadingElement | null>;
    initial: Details;
    signedIn: boolean;
    onBack: (values: Details) => void;
    onSubmit: (values: Details) => void;
}) {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<Details>({
        resolver: zodResolver(detailsSchema),
        defaultValues: initial,
    });

    const field = (name: keyof Details) => ({
        "aria-invalid": !!errors[name],
        "aria-describedby": errors[name] ? `${name}-error` : undefined,
    });

    return (
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold outline-none">
                Your details
            </h2>
            {!signedIn && (
                <p className="mt-1 text-ink-soft">
                    Booking as a guest. <Link href="/signin" className="text-link">Sign in</Link> to manage this booking online later.
                </p>
            )}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="name" className="form-label">Full name</label>
                    <input id="name" autoComplete="name" className="form-input" {...register("name")} {...field("name")} />
                    {errors.name && <p id="name-error" className="form-error">{errors.name.message}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input id="email" type="email" autoComplete="email" className="form-input" {...register("email")} {...field("email")} />
                    {errors.email && <p id="email-error" className="form-error">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="phone" className="form-label">
                        Phone <span className="font-normal text-ink-soft">(optional, for reminders)</span>
                    </label>
                    <input id="phone" type="tel" autoComplete="tel" placeholder="(403) 555-0123" className="form-input" {...register("phone")} {...field("phone")} />
                    {errors.phone && <p id="phone-error" className="form-error">{errors.phone.message}</p>}
                </div>
            </div>

            <div className="mt-5">
                <label htmlFor="notes" className="form-label">
                    Anything we should know? <span className="font-normal text-ink-soft">(optional)</span>
                </label>
                <textarea id="notes" rows={3} maxLength={500} className="form-input" {...register("notes")} {...field("notes")} />
                {errors.notes && <p id="notes-error" className="form-error">{errors.notes.message}</p>}
            </div>

            <StepActions>
                <button type="button" className="secondary-button" onClick={() => onBack(getValues())}>
                    Back
                </button>
                <button type="submit" className="primary-button sm:w-auto">
                    Review booking
                </button>
            </StepActions>
        </form>
    );
}

export default function BookingFlow() {
    const params = useSearchParams();
    return (
        <FreshOnVisit extraKey={params.toString()}>
            <BookingFlowContent />
        </FreshOnVisit>
    );
}
