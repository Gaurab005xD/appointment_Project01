import type { Metadata } from "next";
import { Suspense } from "react";
import BookingFlow from "./booking-flow";

export const metadata: Metadata = {
    title: "Book an appointment",
    description: "Choose a service, pick an open time and confirm your appointment online.",
};

export default function BookingPage() {
    return (
        <main className="flex-1 bg-brand-50/60">
            <div className="page-shell max-w-4xl py-10 md:py-14">
                {/* useSearchParams needs a Suspense boundary so the page can still prerender */}
                <Suspense fallback={<div className="panel h-96 animate-pulse" aria-label="Loading booking" />}>
                    <BookingFlow />
                </Suspense>
            </div>
        </main>
    );
}
