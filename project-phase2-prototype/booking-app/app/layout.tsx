import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { business } from "@/lib/data";

// Fonts are self-hosted (SIL Open Font License) so the site builds offline
const bricolage = localFont({
    src: "./fonts/bricolage-grotesque-latin-wght-normal.woff2",
    variable: "--font-bricolage",
    weight: "200 800",
    display: "swap",
});

const figtree = localFont({
    src: "./fonts/figtree-latin-wght-normal.woff2",
    variable: "--font-figtree",
    weight: "300 900",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: `${business.name} | Book an accountant online`,
        template: `%s | ${business.name}`,
    },
    description:
        "Book tax preparation, bookkeeping and accounting consultations online with a Calgary CPA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en-CA" className={`${bricolage.variable} ${figtree.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col font-sans">
                <a
                    href="#main"
                    className="sr-only rounded-md bg-ink px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
                >
                    Skip to content
                </a>
                <SiteHeader />
                <div id="main" className="flex flex-1 flex-col">
                    {children}
                </div>
                <SiteFooter />
            </body>
        </html>
    );
}
