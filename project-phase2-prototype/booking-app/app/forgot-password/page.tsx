"use client";

import FreshOnVisit from "@/components/fresh-on-visit";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthShell from "@/components/auth-shell";

const schema = z.object({ email: z.email("Please enter a valid email address.") });

function ForgotPasswordPageContent() {
    const [sentTo, setSentTo] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

    if (sentTo) {
        return (
            <AuthShell title="Check your email">
                <p role="status" className="text-center leading-7 text-ink-soft">
                    If an account exists for <strong className="text-ink">{sentTo}</strong>, we sent a link to reset
                    your password. The link expires in 30 minutes.
                </p>
                <Link href="/signin" className="primary-button mt-6">Back to sign in</Link>
            </AuthShell>
        );
    }

    return (
        <AuthShell title="Reset your password" subtitle="Enter your account email and we'll send you a reset link.">
            {/* Same message whether or not the account exists, so emails can't be discovered */}
            <form noValidate onSubmit={handleSubmit((data) => setSentTo(data.email))} className="space-y-5">
                <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="form-input"
                        {...register("email")}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && <p id="email-error" role="alert" className="form-error">{errors.email.message}</p>}
                </div>
                <button type="submit" className="primary-button">Send reset link</button>
            </form>
            <p className="mt-6 text-center text-sm">
                <Link href="/signin" className="font-semibold text-brand-700 hover:underline">Back to sign in</Link>
            </p>
        </AuthShell>
    );
}

export default function ForgotPasswordPage() {
    return (
        <FreshOnVisit>
            <ForgotPasswordPageContent />
        </FreshOnVisit>
    );
}
