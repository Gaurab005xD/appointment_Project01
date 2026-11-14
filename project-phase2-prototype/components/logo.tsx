import Link from "next/link";
import { business } from "@/lib/data";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
    return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
            <rect width="40" height="40" rx="10" fill="#072b2e" />
            <path d="M27 11H13v18h14M13 20h11" fill="none" stroke="#00cccc" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function Logo({ inverted = false }: { inverted?: boolean }) {
    return (
        <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg">
            <LogoMark />
            <span
                className={`font-display text-lg font-bold leading-tight tracking-tight ${inverted ? "text-white" : "text-ink"}`}
            >
                {business.name}
            </span>
        </Link>
    );
}
