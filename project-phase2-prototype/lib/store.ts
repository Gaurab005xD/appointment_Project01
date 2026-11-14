"use client";

import { useMemo, useSyncExternalStore } from "react";
import { addDays, availableSlots, isWorkingDay, toDateKey, type BusyBlock } from "./schedule";
import { getService } from "./data";

// ---------------------------------------------------------------
// PROTOTYPE STORAGE
// Everything here is kept in the browser's localStorage so the
// prototype works without a backend. In production these become
// database tables behind authenticated API routes, and role checks
// happen on the server — never only in the browser.
// ---------------------------------------------------------------

export const statuses = [
    "Pending",
    "Confirmed",
    "Completed",
    "Cancelled by client",
    "Cancelled by accountant",
    "Rescheduled",
    "No-show",
] as const;

export type AppointmentStatus = (typeof statuses)[number];

export type Appointment = {
    id: string;
    serviceId: string;
    date: string;
    time: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    notes: string;
    status: AppointmentStatus;
    createdAt: string;
    rescheduledFrom?: string;
};

export type Session = {
    name: string;
    email: string;
    role: "client" | "admin";
};

export type Profile = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
};

export type BlockedTime = BusyBlock & { id: string; reason: string };

export type AuditEntry = {
    id: string;
    at: string;
    actor: string;
    action: string;
};

export const ADMIN_EMAIL = "admin@northline.example";

// ---------------------------------------------------------------
// Tiny external store with useSyncExternalStore
// ---------------------------------------------------------------

function createStore<T>(key: string, seed: () => T, isValid: (value: unknown) => boolean) {
    let value: T | undefined;
    const listeners = new Set<() => void>();

    function persist() {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Storage can be full or blocked (private mode); keep the in-memory copy.
        }
    }

    function get(): T {
        if (value === undefined) {
            let parsed: unknown = undefined;
            try {
                const raw = localStorage.getItem(key);
                if (raw !== null) parsed = JSON.parse(raw);
            } catch {
                parsed = undefined;
            }
            if (parsed !== undefined && isValid(parsed)) {
                value = parsed as T;
            } else {
                value = seed();
                persist();
            }
        }
        return value;
    }

    function set(next: T | ((previous: T) => T)) {
        value =
            typeof next === "function" ? (next as (previous: T) => T)(get()) : next;
        persist();
        listeners.forEach((listener) => listener());
    }

    function subscribe(listener: () => void) {
        listeners.add(listener);
        const onStorage = (event: StorageEvent) => {
            if (event.key === key) {
                value = undefined;
                listener();
            }
        };
        window.addEventListener("storage", onStorage);
        return () => {
            listeners.delete(listener);
            window.removeEventListener("storage", onStorage);
        };
    }

    /** Returns null during server render / before hydration. */
    function useValue(): T | null {
        return useSyncExternalStore(subscribe, get, () => null);
    }

    /** Drop the cached copy so the next read comes from storage. */
    function refresh() {
        value = undefined;
    }

    return { get, set, useValue, refresh };
}

function newId() {
    return Math.random().toString(36).slice(2, 10);
}

const fromDay = (key: string) => new Date(`${key}T12:00:00`).getDay();

// Sample bookings from other clients so the calendar shows real conflicts
function seedAppointments(): Appointment[] {
    const today = toDateKey(new Date());
    const samples: [number, string, string, string][] = [
        [1, "tax-preparation", "10:00", "Priya Nair"],
        [1, "bookkeeping", "13:30", "Lakeview Bakery Ltd."],
        [2, "accounting-consultation", "09:00", "Marcus Bell"],
        [2, "business-tax", "14:00", "Ortiz Landscaping"],
        [3, "tax-preparation", "11:00", "Hannah Wu"],
        [4, "gst-filing", "09:30", "Ridge Coffee Co."],
        [-3, "tax-preparation", "10:00", "Priya Nair"],
    ];
    // Offsets count working days only, so samples never land on a closed day
    const workingDay = (offset: number) => {
        let date = today;
        let remaining = Math.abs(offset);
        const step = offset < 0 ? -1 : 1;
        while (remaining > 0) {
            date = addDays(date, step);
            if (isWorkingDay(date) && fromDay(date) !== 6) remaining--;
        }
        return date;
    };
    return samples.map(([offset, serviceId, time, name]) => ({
        id: newId(),
        serviceId,
        date: workingDay(offset),
        time,
        clientName: name,
        clientEmail: `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/\.$/, "")}@example.com`,
        notes: "",
        status: offset < 0 ? "Completed" : "Confirmed",
        createdAt: new Date().toISOString(),
    }));
}

const isArray = (value: unknown) => Array.isArray(value);

export const sessionStore = createStore<Session | null>(
    "northline.session",
    () => null,
    (value) =>
        value === null ||
        (typeof value === "object" && typeof (value as Session).email === "string")
);

export const profilesStore = createStore<Profile[]>("northline.profiles", () => [], isArray);

export const appointmentsStore = createStore<Appointment[]>(
    "northline.appointments",
    seedAppointments,
    isArray
);

export const blockedStore = createStore<BlockedTime[]>(
    "northline.blocked",
    () => [],
    isArray
);

export const auditStore = createStore<AuditEntry[]>("northline.audit", () => [], isArray);

// ---------------------------------------------------------------
// Clock: avoids calling Date during server prerender (which
// Cache Components forbids) and keeps "today" fresh each minute.
// ---------------------------------------------------------------

function subscribeClock(listener: () => void) {
    const timer = window.setInterval(listener, 30_000);
    return () => window.clearInterval(timer);
}

function clockSnapshot() {
    const now = new Date();
    return `${toDateKey(now)}|${now.getHours() * 60 + now.getMinutes()}`;
}

export function useClock() {
    const snapshot = useSyncExternalStore(subscribeClock, clockSnapshot, () => null);
    return useMemo(() => {
        if (!snapshot) return null;
        const [today, minutes] = snapshot.split("|");
        return { today, nowMinutes: Number(minutes) };
    }, [snapshot]);
}

function subscribeNothing() {
    return () => {};
}

/** true once running in the browser */
export function useHydrated() {
    return useSyncExternalStore(
        subscribeNothing,
        () => true,
        () => false
    );
}

// ---------------------------------------------------------------
// Actions
// ---------------------------------------------------------------

export function logAudit(actor: string, action: string) {
    auditStore.set((entries) =>
        [{ id: newId(), at: new Date().toISOString(), actor, action }, ...entries].slice(0, 200)
    );
}

export function signIn(email: string) {
    const normalized = email.trim().toLowerCase();
    if (normalized === ADMIN_EMAIL) {
        sessionStore.set({ name: "Abdullatif Rizayee", email: normalized, role: "admin" });
        logAudit("Abdullatif Rizayee", "Signed in to the dashboard");
        return "admin" as const;
    }
    const profile = profilesStore.get().find((p) => p.email === normalized);
    // A guest who booked earlier keeps the name they booked with
    const bookedName = appointmentsStore
        .get()
        .findLast((a) => a.clientEmail === normalized)?.clientName;
    const fallbackName = bookedName ?? normalized
        .split("@")[0]
        .split(/[._-]+/)
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ");
    sessionStore.set({
        name: profile ? `${profile.firstName} ${profile.lastName}` : fallbackName,
        email: normalized,
        role: "client",
    });
    return "client" as const;
}

export function signOut() {
    sessionStore.set(null);
}

export function saveProfile(profile: Profile) {
    const email = profile.email.trim().toLowerCase();
    profilesStore.set((profiles) => [
        ...profiles.filter((p) => p.email !== email),
        { ...profile, email },
    ]);
}

export class SlotTakenError extends Error {
    constructor() {
        super("That time was just booked by someone else. Please choose another time.");
    }
}

/**
 * Books an appointment. Re-checks availability at the moment of
 * saving so two people cannot take the same slot (double booking).
 */
export function createAppointment(
    input: Omit<Appointment, "id" | "createdAt" | "status">,
    options: { replaceId?: string } = {}
) {
    const service = getService(input.serviceId);
    if (!service) throw new Error("Unknown service.");

    // Always check against the latest saved bookings, not a cached copy,
    // in case another tab or person booked in the meantime.
    appointmentsStore.refresh();
    blockedStore.refresh();

    const now = new Date();
    const free = availableSlots({
        service,
        date: input.date,
        today: toDateKey(now),
        nowMinutes: now.getHours() * 60 + now.getMinutes(),
        appointments: appointmentsStore.get(),
        blocked: blockedStore.get(),
        ignoreAppointmentId: options.replaceId,
    });
    if (!free.includes(input.time)) throw new SlotTakenError();

    const appointment: Appointment = {
        ...input,
        id: newId(),
        createdAt: now.toISOString(),
        status: "Confirmed",
        rescheduledFrom: options.replaceId,
    };

    appointmentsStore.set((list) => [
        ...list.map((a) =>
            a.id === options.replaceId ? { ...a, status: "Rescheduled" as const } : a
        ),
        appointment,
    ]);

    logAudit(
        input.clientName,
        options.replaceId
            ? `Rescheduled ${service.name} to ${input.date} ${input.time}`
            : `Booked ${service.name} for ${input.date} ${input.time}`
    );

    return appointment;
}

export function setAppointmentStatus(id: string, status: AppointmentStatus, actor: string) {
    const appointment = appointmentsStore.get().find((a) => a.id === id);
    if (!appointment) return;
    appointmentsStore.set((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    logAudit(
        actor,
        `Changed ${appointment.clientName}'s ${appointment.date} ${appointment.time} appointment to "${status}"`
    );
}

export function addBlockedTime(block: Omit<BlockedTime, "id">, actor: string) {
    blockedStore.set((list) => [...list, { ...block, id: newId() }]);
    logAudit(actor, `Blocked ${block.date} ${block.start}–${block.end} (${block.reason})`);
}

export function removeBlockedTime(id: string, actor: string) {
    const block = blockedStore.get().find((b) => b.id === id);
    blockedStore.set((list) => list.filter((b) => b.id !== id));
    if (block) logAudit(actor, `Removed blocked time on ${block.date} ${block.start}–${block.end}`);
}
