"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthShell from "@/components/auth-shell";
import PasswordInput from "@/components/password-input";
import { ADMIN_EMAIL, signIn } from "@/lib/store";

const signInSchema = z.object({
    email: z.email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
});

type SignInInputs = z.infer<typeof signInSchema>;

export default function SignInPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInInputs>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    // Prototype only: any password of 8+ characters is accepted.
    // A real app verifies the password on the server (e.g. Firebase Auth)
    // and sets a secure, httpOnly session cookie.
    const onSubmit = (data: SignInInputs) => {
        const role = signIn(data.email);
        router.push(role === "admin" ? "/admin" : "/account");
    };

    return (
        <AuthShell title="Sign in" subtitle="Manage your appointments or book a new one.">
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...register("email")}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className="form-input"
                    />
                    {errors.email && (
                        <p id="email-error" role="alert" className="form-error">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <div className="flex items-baseline justify-between">
                        <label htmlFor="password" className="form-label">Password</label>
                        <Link href="/forgot-password" className="text-sm font-semibold text-brand-700 hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <PasswordInput
                        id="password"
                        autoComplete="current-password"
                        {...register("password")}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    {errors.password && (
                        <p id="password-error" role="alert" className="form-error">{errors.password.message}</p>
                    )}
                </div>

                <button type="submit" className="primary-button" disabled={isSubmitting}>
                    Sign in
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-soft">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-brand-700 hover:underline">Create an account</Link>
            </p>
            <p className="mt-2 text-center text-sm text-ink-soft">
                Or <Link href="/booking" className="font-semibold text-brand-700 hover:underline">book as a guest</Link>
            </p>

            <p className="mt-6 rounded-lg bg-brand-50 p-3 text-xs leading-5 text-ink-soft">
                Prototype: sign in with any email and an 8+ character password. Use{" "}
                <strong className="text-ink">{ADMIN_EMAIL}</strong> to see the accountant dashboard.
            </p>
        </AuthShell>
    );
}
