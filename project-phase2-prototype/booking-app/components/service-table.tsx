import Link from "next/link";
import { activeServices, formatDuration, formatPrice } from "@/lib/data";

/** Services laid out like ledger rows: name, length, format, price. */
export default function ServiceTable() {
    return (
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white">
            <table className="w-full text-left">
                <caption className="sr-only">Accounting services with length, format and price</caption>
                <thead className="hidden bg-brand-50 text-sm text-ink-soft md:table-header-group">
                    <tr>
                        <th scope="col" className="px-6 py-3 font-semibold">Service</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Length</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Format</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">Price</th>
                        <th scope="col" className="px-6 py-3"><span className="sr-only">Book</span></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {activeServices.map((service) => (
                        <tr key={service.id} className="flex flex-col gap-1 p-5 md:table-row md:p-0">
                            <th scope="row" className="font-normal md:px-6 md:py-5">
                                <span className="block font-display text-lg font-semibold">{service.name}</span>
                                <span className="text-sm text-ink-soft">{service.summary}</span>
                            </th>
                            <td className="figures text-sm text-ink-soft md:px-4 md:py-5 md:text-base md:text-ink">
                                {formatDuration(service.duration)}
                                <span className="md:hidden"> · {service.mode} · {formatPrice(service)}</span>
                            </td>
                            <td className="hidden px-4 py-5 md:table-cell">{service.mode}</td>
                            <td className="figures hidden px-4 py-5 text-right font-semibold md:table-cell">
                                {formatPrice(service)}
                            </td>
                            <td className="pt-2 md:px-6 md:py-5 md:text-right">
                                <Link
                                    href={`/booking?service=${service.id}`}
                                    className="inline-flex rounded-md border border-brand-700 px-3.5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                                    aria-label={`Book ${service.name}`}
                                >
                                    Book
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
