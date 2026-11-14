import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/page-intro";
import { activeServices, formatDuration, formatPrice, policies } from "@/lib/data";

export const metadata: Metadata = {
    title: "Services",
    description: "Tax preparation, bookkeeping, GST filing and accounting consultations in Calgary.",
};

export default function ServicesPage() {
    return (
        <main>
            <PageIntro title="Services and prices">
                Every service has a fixed price and a set length, so the calendar only offers times
                that fit. Prices are in Canadian dollars, before GST.
            </PageIntro>

            <div className="page-shell py-12 md:py-16">
                <ul className="divide-y divide-line border-y border-line">
                    {activeServices.map((service) => (
                        <li
                            key={service.id}
                            id={service.id}
                            className="grid scroll-mt-24 gap-6 py-10 md:grid-cols-[17rem_1fr] md:gap-10 lg:grid-cols-[17rem_1fr_17rem]"
                        >
                            <div>
                                <h2 className="font-display text-2xl font-bold tracking-tight">{service.name}</h2>
                                <dl className="figures mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
                                    <dt className="text-ink-soft">Length</dt>
                                    <dd className="font-semibold">{formatDuration(service.duration)}</dd>
                                    <dt className="text-ink-soft">Price</dt>
                                    <dd className="font-semibold">{formatPrice(service)}</dd>
                                    <dt className="text-ink-soft">Format</dt>
                                    <dd className="font-semibold">{service.mode}</dd>
                                    {service.location && (
                                        <>
                                            <dt className="text-ink-soft">Where</dt>
                                            <dd className="font-semibold">{service.location}</dd>
                                        </>
                                    )}
                                </dl>
                            </div>

                            <div>
                                <p className="leading-7">{service.description}</p>
                                <h3 className="mt-5 text-sm font-semibold text-ink-soft">Included</h3>
                                <ul className="mt-2 space-y-1.5">
                                    {service.includes.map((item) => (
                                        <li key={item} className="flex gap-2.5">
                                            <svg viewBox="0 0 20 20" className="mt-1 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true">
                                                <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="md:col-start-2 lg:col-start-auto lg:pt-1 lg:text-right">
                                <Link href={`/booking?service=${service.id}`} className="primary-button md:w-auto">
                                    Book {service.name}
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>

                <section aria-labelledby="policy-title" className="mt-12 grid gap-6 rounded-2xl bg-ink p-8 text-brand-100 md:grid-cols-2">
                    <div>
                        <h2 id="policy-title" className="font-display text-xl font-semibold text-white">
                            Booking and cancellation policy
                        </h2>
                        <p className="mt-3 leading-7">{policies.cancellationText}</p>
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-semibold text-white">Before you come in</h2>
                        <p className="mt-3 leading-7">{policies.documentsText}</p>
                    </div>
                </section>
            </div>
        </main>
    );
}
