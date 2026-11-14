import {
    holidays,
    policies,
    workingHours,
    type Service,
    getService,
} from "./data";

// ---------------------------------------------------------------
// Date helpers. Dates are stored as "YYYY-MM-DD" in local time and
// times as "HH:MM" (24 h) so they compare correctly as strings.
// ---------------------------------------------------------------

export function toDateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;
}

export function fromDateKey(key: string) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number) {
    const date = fromDateKey(key);
    date.setDate(date.getDate() + days);
    return toDateKey(date);
}

export function toMinutes(time: string) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

export function toTime(minutes: number) {
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function formatTime(time: string) {
    const minutes = toMinutes(time);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const suffix = h >= 12 ? "pm" : "am";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDate(key: string, style: "long" | "short" = "long") {
    return fromDateKey(key).toLocaleDateString("en-CA", {
        weekday: style === "long" ? "long" : "short",
        month: style === "long" ? "long" : "short",
        day: "numeric",
        year: style === "long" ? "numeric" : undefined,
    });
}

// ---------------------------------------------------------------
// Availability
// ---------------------------------------------------------------

export type BusyBlock = {
    date: string;
    start: string;
    end: string;
};

export type BookedAppointment = {
    id: string;
    serviceId: string;
    date: string;
    time: string;
    status: string;
};

const inactiveStatuses = new Set([
    "Cancelled by client",
    "Cancelled by accountant",
    "Rescheduled",
]);

export function appointmentEnd(appointment: BookedAppointment) {
    const service = getService(appointment.serviceId);
    return toMinutes(appointment.time) + (service?.duration ?? 60);
}

/** Times (HH:MM) that are free for this service on this date. */
export function availableSlots(options: {
    service: Service;
    date: string;
    today: string;
    nowMinutes: number;
    appointments: BookedAppointment[];
    blocked: BusyBlock[];
    ignoreAppointmentId?: string;
}) {
    const { service, date, today, nowMinutes, appointments, blocked, ignoreAppointmentId } =
        options;

    if (date < today) return [];
    if (date > addDays(today, policies.bookingWindowDays)) return [];
    if (holidays[date]) return [];

    const periods = workingHours[fromDateKey(date).getDay()] ?? [];

    // Busy ranges: other appointments (plus their buffer) and blocked periods
    const busy: { start: number; end: number }[] = [];

    for (const appointment of appointments) {
        if (appointment.date !== date) continue;
        if (appointment.id === ignoreAppointmentId) continue;
        if (inactiveStatuses.has(appointment.status)) continue;
        const other = getService(appointment.serviceId);
        busy.push({
            start: toMinutes(appointment.time),
            end: appointmentEnd(appointment) + (other?.buffer ?? 0),
        });
    }

    for (const block of blocked) {
        if (block.date !== date) continue;
        busy.push({ start: toMinutes(block.start), end: toMinutes(block.end) });
    }

    const earliest = date === today ? nowMinutes + policies.minimumNoticeMinutes : 0;
    const slots: string[] = [];

    for (const period of periods) {
        for (
            let start = period.start;
            start + service.duration <= period.end;
            start += policies.slotStep
        ) {
            if (start < earliest) continue;
            // This appointment's own buffer must also stay clear
            const end = start + service.duration + service.buffer;
            const clashes = busy.some((range) => start < range.end && end > range.start);
            if (!clashes) slots.push(toTime(start));
        }
    }

    return slots;
}

/** Whether the office is open at all on this date. */
export function isWorkingDay(date: string) {
    if (holidays[date]) return false;
    return (workingHours[fromDateKey(date).getDay()] ?? []).length > 0;
}

/** Hours until an appointment starts, given the current clock. */
export function hoursUntil(date: string, time: string, today: string, nowMinutes: number) {
    const dayDiff = Math.round(
        (fromDateKey(date).getTime() - fromDateKey(today).getTime()) / 86_400_000
    );
    return (dayDiff * 24 * 60 + toMinutes(time) - nowMinutes) / 60;
}
