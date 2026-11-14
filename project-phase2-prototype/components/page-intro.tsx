export default function PageIntro({
    title,
    children,
}: {
    title: string;
    children?: React.ReactNode;
}) {
    return (
        <section className="border-b border-line bg-brand-50">
            <div className="page-shell py-12 md:py-16">
                <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                    {title}
                </h1>
                {children && (
                    <div className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">{children}</div>
                )}
            </div>
        </section>
    );
}
