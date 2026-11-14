"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";

/**
 * Next.js 16 (Cache Components) keeps pages alive between navigations.
 * For one-off flows (booking, sign up, contact) a stale "You're booked"
 * screen would be confusing, so this resets the subtree whenever the page
 * is opened by a link, while back/forward still restores it.
 * `extraKey` also resets it when only the query string changes.
 */
export default function FreshOnVisit({
    children,
    extraKey = "",
}: {
    children: React.ReactNode;
    extraKey?: string;
}) {
    const { bfcacheId } = useRouter();
    return <Fragment key={`${bfcacheId}|${extraKey}`}>{children}</Fragment>;
}
