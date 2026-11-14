import Link from "next/link";
import NextOpenings from "@/components/next-openings";
import ServiceTable from "@/components/service-table";
import { business, faqs, hoursSummary, policies } from "@/lib/data";

const steps = [
    { title: "Choose a service", text: "Tax return, bookkeeping, GST or a quick consultation." },
    { title: "Pick a time", text: "Only times that are actually free are shown." },
    { title: "Add your details", text: "Book as a guest or sign in to manage bookings later." },
    { title: "Get your confirmation", text: "By email right away, with a reminder the day before." },
];

export default function Home() {
    return (
        <main>
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-line">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_31px,var(--color-line)_32px)] bg-[length:100%_32px] opacity-50 [mask-image:linear-gradient(to_right,transparent,black_60%)]"
                />
                <div className="page-shell relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr]">
                    <div>
                        <p className="text-[15px] font-semibold text-brand-700">
                            {business.accountant} · Calgary, Alberta
                        </p>
                        <h1 className="mt-4 max-w-[14ch] font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                            Your taxes and books, handled by a real accountant.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-ink-soft">
                            Personal returns, small-business filing and bookkeeping for Calgary
                            households and owners. Choose a service, see the real openings, and book in
                            about two minutes.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href="/booking" className="primary-button sm:w-auto">
                                Book appointment
                            </Link>
                            <Link href="/services" className="secondary-button">
                                See services and prices
                            </Link>
                        </div>
                        <ul className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-6 text-sm text-ink-soft">
                            <li>
                                <strong className="block font-display text-2xl text-ink">14 yrs</strong>
                                in practice
                            </li>
                            <li>
                                <strong className="block font-display text-2xl text-ink">1,200+</strong>
                                returns filed
                            </li>
                            <li>
                                <strong className="block font-display text-2xl text-ink">CPA</strong>
                                Alberta member
                            </li>
                        </ul>
                    </div>

                    <NextOpenings />
                </div>
            </section>

            {/* Services */}
            <section aria-labelledby="services-title" className="page-shell py-16 md:py-20">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h2 id="services-title" className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                            Services and prices
                        </h2>
                        <p className="mt-3 max-w-xl text-ink-soft">
                            Fixed prices, so you know the cost before you book. Pay at the end of your appointment.
                        </p>
                    </div>
                    <Link href="/services" className="text-link">
                        Full service details
                    </Link>
                </div>
                <ServiceTable />
            </section>

            {/* How booking works — a real sequence, so it is numbered */}
            <section aria-labelledby="how-title" className="border-y border-line bg-brand-50">
                <div className="page-shell py-16">
                    <h2 id="how-title" className="font-display text-3xl font-bold tracking-tight">
                        How booking works
                    </h2>
                    <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, index) => (
                            <li key={step.title} className="relative border-t-2 border-brand pt-5">
                                <span className="font-display text-sm font-bold text-brand-700">
                                    Step {index + 1}
                                </span>
                                <h3 className="mt-1 font-display text-xl font-semibold">{step.title}</h3>
                                <p className="mt-2 text-ink-soft">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Hours, location, FAQ */}
            <section aria-labelledby="visit-title" className="border-t border-line bg-white">
                <div className="page-shell grid gap-12 py-16 md:grid-cols-2">
                    <div>
                        <h2 id="visit-title" className="font-display text-3xl font-bold tracking-tight">
                            Hours and location
                        </h2>
                        <dl className="mt-6 divide-y divide-line border-y border-line">
                            {hoursSummary.map((row) => (
                                <div key={row.days} className="flex justify-between gap-4 py-3">
                                    <dt className="text-ink-soft">{row.days}</dt>
                                    <dd className="figures font-semibold">{row.hours}</dd>
                                </div>
                            ))}
                        </dl>
                        <p className="mt-6 leading-7">
                            {business.address}
                            <br />
                            <span className="text-ink-soft">{business.serviceArea}</span>
                        </p>
                        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                            <a className="text-link" href={business.phoneHref}>{business.phone}</a>
                            <a className="text-link" href={`mailto:${business.email}`}>{business.email}</a>
                        </p>
                    </div>

                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-tight">Common questions</h2>
                        <div className="mt-6 divide-y divide-line border-y border-line">
                            {faqs.slice(0, 4).map((faq) => (
                                <details key={faq.q} className="group py-4">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                                        {faq.q}
                                        <span aria-hidden="true" className="text-xl text-brand-700 transition group-open:rotate-45">+</span>
                                    </summary>
                                    <p className="mt-3 leading-7 text-ink-soft">{faq.a}</p>
                                </details>
                            ))}
                        </div>
                        <Link href="/faq" className="text-link mt-5 inline-block">
                            All questions
                        </Link>
                    </div>
                </div>
            </section>

            {/* Closing call to action */}
            <section className="bg-ink">
                <div className="page-shell flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center">
                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Tax season fills up fast.
                        </h2>
                        <p className="mt-2 max-w-xl text-brand-100/85">{policies.cancellationText}</p>
                    </div>
                    <Link
                        href="/booking"
                        className="shrink-0 rounded-lg bg-brand px-6 py-3.5 font-semibold text-ink transition hover:bg-brand-300"
                    >
                        Book appointment
                    </Link>
                </div>
            </section>
        </main>
    );
}
