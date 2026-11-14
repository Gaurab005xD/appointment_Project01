import Link from "next/link";

export default function NotFound() {
    return (
        <main className="page-shell flex flex-1 flex-col items-start justify-center py-24">
            <p className="figures font-display text-7xl font-bold text-brand">404</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">This page doesn&apos;t exist</h1>
            <p className="mt-3 max-w-lg text-lg text-ink-soft">
                The link may be old or mistyped. You can head home or go straight to booking.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/" className="primary-button sm:w-auto">Go to the home page</Link>
                <Link href="/booking" className="secondary-button">Book appointment</Link>
            </div>
        </main>
    );
}
