import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/page-intro";
import { business, credentials } from "@/lib/data";

export const metadata: Metadata = {
    title: "About",
    description: "Abdullatif Rizayee, CPA: background, qualifications and how Easy Financial and Tax Solution Inc. works.",
};

const expertise = [
    "Personal and family tax returns",
    "Self-employed and sole proprietor income",
    "Small corporations (T2) and year-end",
    "GST registration and filing",
    "Rental property income",
    "CRA reviews and reassessments",
];

export default function AboutPage() {
    return (
        <main>
            <PageIntro title="About Abdullatif Rizayee, CPA">
                One accountant, the same one every year. {business.name} is a small, independent
                practice in downtown Calgary.
            </PageIntro>

            <div className="page-shell grid gap-12 py-12 md:py-16 lg:grid-cols-[0.8fr_1.2fr]">
                <aside className="space-y-6">
                    {/* Placeholder until a professional photo is supplied */}
                    <div
                        role="img"
                        aria-label="Photo of Abdullatif Rizayee coming soon"
                        className="grid aspect-[4/5] place-items-center rounded-2xl bg-ink"
                    >
                        <span className="font-display text-8xl font-bold text-brand">AR</span>
                    </div>
                    <div className="panel p-6">
                        <h2 className="font-display text-lg font-semibold">Business information</h2>
                        <dl className="mt-3 space-y-2 text-sm">
                            <div><dt className="text-ink-soft">Practice</dt><dd className="font-semibold">{business.name}</dd></div>
                            <div><dt className="text-ink-soft">Office</dt><dd className="font-semibold">{business.address}</dd></div>
                            <div><dt className="text-ink-soft">Service area</dt><dd className="font-semibold">{business.serviceArea}</dd></div>
                        </dl>
                    </div>
                </aside>

                <div>
                    <h2 className="font-display text-3xl font-bold tracking-tight">Why I started Easy Financial</h2>
                    <div className="mt-5 max-w-[65ch] space-y-4 text-lg leading-8 text-ink-soft">
                        <p>
                            At bigger firms, I saw clients passed between staff every year and charged for
                            the time it took to re-learn their file. I started Easy Financial so people could
                            work with one accountant who remembers them.
                        </p>
                        <p>
                            Most of my clients are families, freelancers and small businesses with fewer
                            than ten employees. I explain things in plain language, tell you the price
                            before we start, and answer email myself.
                        </p>
                    </div>

                    <h2 className="mt-12 font-display text-2xl font-bold tracking-tight">Qualifications and memberships</h2>
                    <ul className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
                        {credentials.map((c) => (
                            <li key={c.title} className="bg-white p-5">
                                <p className="font-semibold">{c.title}</p>
                                <p className="mt-1 text-sm text-ink-soft">{c.detail}</p>
                            </li>
                        ))}
                    </ul>

                    <h2 className="mt-12 font-display text-2xl font-bold tracking-tight">Areas of expertise</h2>
                    <ul className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                        {expertise.map((item) => (
                            <li key={item} className="border-b border-line py-2">{item}</li>
                        ))}
                    </ul>

                    <div className="mt-12 flex flex-col gap-3 sm:flex-row">
                        <Link href="/booking" className="primary-button sm:w-auto">Book appointment</Link>
                        <Link href="/contact" className="secondary-button">Ask a question first</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
