import { LogoMark } from "./logo";

/** Shared frame for sign in, sign up and password reset. */
export default function AuthShell({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <main className="flex flex-1 items-start justify-center bg-brand-50/60 px-4 py-12 md:py-16">
            <div className="w-full max-w-lg">
                <div className="panel overflow-hidden">
                    <div className="h-1.5 bg-brand" aria-hidden="true" />
                    <div className="p-6 sm:p-8">
                        <div className="mb-8 text-center">
                            <LogoMark className="mx-auto h-11 w-11" />
                            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">{title}</h1>
                            {subtitle && <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>}
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
