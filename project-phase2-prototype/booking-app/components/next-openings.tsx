"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { activeServices, formatDuration, formatPrice } from "@/lib/data";
import { addDays, availableSlots, formatDate, formatTime } from "@/lib/schedule";
import { appointmentsStore, blockedStore, useClock } from "@/lib/store";

type Opening = { date: string; time: string };

/** Hero panel: the next few open times for the chosen service. */
export default function NextOpenings() {
    const [serviceId, setServiceId] = useState(activeServices[0].id);
    const clock = useClock();
    const appointments = appointmentsStore.useValue();
    const blocked = blockedStore.useValue();
    const service = activeServices.find((s) => s.id === serviceId) ?? activeServices[0];

    const openings = useMemo<Opening[] | null>(() => {
        if (!clock || !appointments || !blocked) return null;
        const found: Opening[] = [];
        for (let i = 0; i < 30 && found.length < 4; i++) {
            const date = addDays(clock.today, i);
            const slots = availableSlots({
                service,
                date,
                today: clock.today,
                nowMinutes: clock.nowMinutes,
                appointments,
                blocked,
            });
            // At most two per day so visitors see a spread of days
            for (const time of slots.slice(0, 2)) {
                if (found.length < 4) found.push({ date, time });
            }
        }
        return found;
    }, [clock, appointments, blocked, service]);

    return (
        <section aria-labelledby="openings-title" className="panel relative overflow-hidden shadow-[0_24px_60px_-30px_rgba(7,43,46,0.45)]">
            <div className="h-1.5 bg-brand" aria-hidden="true" />
            <div className="p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-3">
                    <h2 id="openings-title" className="font-display text-xl font-semibold">
                        Next openings
                    </h2>
                    <span className="text-sm text-ink-soft">Mountain time</span>
                </div>

                <label htmlFor="opening-service" className="form-label mt-4">
                    Service
                </label>
                <select
                    id="opening-service"
                    className="form-input"
                    value={serviceId}
                    onChange={(event) => setServiceId(event.target.value)}
                >
                    {activeServices.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
                <p className="figures mt-2 text-sm text-ink-soft">
                    {formatDuration(service.duration)} · {formatPrice(service)} · {service.mode}
                </p>

                <ul className="mt-4 divide-y divide-line border-y border-line" aria-live="polite">
                    {openings === null
                        ? [0, 1, 2, 3].map((n) => (
                              <li key={n} className="flex h-14 items-center">
                                  <span className="h-3 w-2/3 animate-pulse rounded bg-brand-50" />
                              </li>
                          ))
                        : openings.length === 0
                          ? (
                              <li className="py-4 text-sm text-ink-soft">
                                  No openings in the next 30 days. Call us and we will find a time.
                              </li>
                          )
                          : openings.map((opening) => (
                              <li key={`${opening.date}-${opening.time}`}>
                                  <Link
                                      href={`/booking?service=${service.id}&date=${opening.date}&time=${opening.time}`}
                                      className="group flex min-h-14 items-center justify-between gap-3 py-2 hover:bg-brand-50"
                                  >
                                      <span className="figures">
                                          <span className="block font-semibold">{formatDate(opening.date, "short")}</span>
                                          <span className="text-sm text-ink-soft">{formatTime(opening.time)}</span>
                                      </span>
                                      <span className="rounded-md border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 group-hover:border-brand-700">
                                          Book this time
                                      </span>
                                  </Link>
                              </li>
                          ))}
                </ul>

                <Link href={`/booking?service=${service.id}`} className="text-link mt-4 inline-block text-sm">
                    See all times for {service.name}
                </Link>
            </div>
        </section>
    );
}
