import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/page-intro";
import { faqs } from "@/lib/data";

export const metadata: Metadata = {
    title: "FAQ",
    description: "Answers about booking, documents, payment, privacy and online appointments.",
};

export default function FaqPage() {
    return (
        <main>
            <PageIntro title="Frequently asked questions">
                Can&apos;t find your answer? <Link href="/contact" className="text-link">Send a message</Link> and
                Abdullatif will reply within one business day.
            </PageIntro>

            <div className="page-shell max-w-3xl py-12 md:py-16">
                <div className="divide-y divide-line border-y border-line">
                    {faqs.map((faq) => (
                        <details key={faq.q} className="group py-5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-semibold">
                                {faq.q}
                                <span
                                    aria-hidden="true"
                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-xl text-brand-700 transition group-open:rotate-45"
                                >
                                    +
                                </span>
                            </summary>
                            <p className="mt-3 max-w-[65ch] leading-7 text-ink-soft">{faq.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </main>
    );
}
