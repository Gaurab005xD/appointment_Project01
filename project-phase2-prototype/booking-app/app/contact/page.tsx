import type { Metadata } from "next";
import PageIntro from "@/components/page-intro";
import ContactForm from "./contact-form";
import { business, hoursSummary } from "@/lib/data";

export const metadata: Metadata = {
    title: "Contact",
    description: "Send Easy Financial and Tax Solution Inc. a message, call, or visit the Calgary office.",
};

export default function ContactPage() {
    return (
        <main>
            <PageIntro title="Contact">
                Questions before you book, or about an existing appointment? Send a message and you&apos;ll
                hear back within one business day.
            </PageIntro>

            <div className="page-shell grid gap-10 py-12 md:py-16 lg:grid-cols-[1.5fr_1fr]">
                <ContactForm />

                <aside className="space-y-8">
                    <div>
                        <h2 className="font-display text-xl font-semibold">Call or email</h2>
                        <p className="mt-3 space-y-1">
                            <a className="text-link block w-fit" href={business.phoneHref}>{business.phone}</a>
                            <a className="text-link mt-2 block w-fit" href={`mailto:${business.email}`}>{business.email}</a>
                        </p>
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-semibold">Office</h2>
                        <p className="mt-3 leading-7">
                            {business.address}
                            <br />
                            <span className="text-ink-soft">{business.serviceArea}</span>
                        </p>
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-semibold">Hours</h2>
                        <dl className="mt-3 divide-y divide-line border-y border-line text-sm">
                            {hoursSummary.map((row) => (
                                <div key={row.days} className="flex justify-between gap-4 py-2.5">
                                    <dt className="text-ink-soft">{row.days}</dt>
                                    <dd className="figures font-semibold">{row.hours}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </aside>
            </div>
        </main>
    );
}
