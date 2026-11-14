import Link from "next/link";
import Logo from "./logo";
import { business, hoursSummary } from "@/lib/data";

export default function SiteFooter() {
    return (
        <footer className="mt-auto bg-ink text-brand-100">
            <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
                <div className="max-w-xs">
                    <Logo inverted />
                    <p className="mt-4 text-sm leading-6 text-brand-100/80">{business.tagline}.</p>
                </div>

                <div>
                    <h2 className="font-display text-base font-semibold text-white">Visit</h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li><Link className="hover:text-white" href="/services">Services</Link></li>
                        <li><Link className="hover:text-white" href="/about">About</Link></li>
                        <li><Link className="hover:text-white" href="/faq">FAQ</Link></li>
                        <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h2 className="font-display text-base font-semibold text-white">Your account</h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li><Link className="hover:text-white" href="/booking">Book appointment</Link></li>
                        <li><Link className="hover:text-white" href="/account">My appointments</Link></li>
                        <li><Link className="hover:text-white" href="/signin">Sign in</Link></li>
                        <li><Link className="hover:text-white" href="/signup">Create account</Link></li>
                    </ul>
                </div>

                <div>
                    <h2 className="font-display text-base font-semibold text-white">Office hours</h2>
                    <dl className="mt-3 space-y-1.5 text-sm">
                        {hoursSummary.map((row) => (
                            <div key={row.days} className="flex justify-between gap-4">
                                <dt className="text-brand-100/80">{row.days}</dt>
                                <dd className="figures shrink-0 text-white">{row.hours}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="page-shell flex flex-col gap-2 py-5 text-sm text-brand-100/70 sm:flex-row sm:justify-between">
                    <p>
                        {business.address} ·{" "}
                        <a className="hover:text-white" href={business.phoneHref}>{business.phone}</a>
                    </p>
                    <p>Prototype for CPSY 301. Information shown is sample content.</p>
                </div>
            </div>
        </footer>
    );
}
