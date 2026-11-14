"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./logo";
import { sessionStore } from "@/lib/store";

const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
    const pathname = usePathname();
    const session = sessionStore.useValue();
    const [openFor, setOpenFor] = useState<string | null>(null);
    // Menu closes automatically when the route changes
    const open = openFor === pathname;

    const accountLink = session
        ? session.role === "admin"
            ? { href: "/admin", label: "Dashboard" }
            : { href: "/account", label: "My appointments" }
        : { href: "/signin", label: "Sign in" };

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
            <div className="page-shell flex h-16 items-center justify-between gap-4">
                <Logo />

                <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={isActive(link.href) ? "page" : undefined}
                            className="rounded-md px-3 py-2 text-[15px] font-medium text-ink-soft transition hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-brand aria-[current=page]:decoration-[3px] aria-[current=page]:underline-offset-8"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    <Link
                        href={accountLink.href}
                        className="rounded-md px-3 py-2 text-[15px] font-semibold text-brand-700 hover:text-brand-800"
                    >
                        {accountLink.label}
                    </Link>
                    <Link
                        href="/booking"
                        className="rounded-lg bg-brand-700 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-brand-800"
                    >
                        Book appointment
                    </Link>
                </div>

                <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-white lg:hidden"
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    onClick={() => setOpenFor(open ? null : pathname)}
                >
                    <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        {open ? (
                            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        ) : (
                            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        )}
                    </svg>
                </button>
            </div>

            {open && (
                <nav
                    id="mobile-menu"
                    aria-label="Main"
                    className="border-t border-line bg-paper px-4 pb-5 pt-2 lg:hidden"
                >
                    <ul className="flex flex-col">
                        {[...links, accountLink].map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    aria-current={isActive(link.href) ? "page" : undefined}
                                    className="block border-b border-line py-3 text-base font-medium aria-[current=page]:text-brand-700"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Link href="/booking" className="primary-button mt-4">
                        Book appointment
                    </Link>
                </nav>
            )}
        </header>
    );
}
