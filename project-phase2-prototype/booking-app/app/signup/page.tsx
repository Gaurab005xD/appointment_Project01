"use client";

import FreshOnVisit from "@/components/fresh-on-visit";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import PasswordInput from "@/components/password-input";
import { saveProfile, signIn } from "@/lib/store";

// -------------------------------------------
// Validation rules for the sign-up form
// -------------------------------------------

const signUpSchema = z
    .object({
        firstName: z.string().trim().min(2, "Please enter your first name."),
        lastName: z.string().trim().min(2, "Please enter your last name."),
        email: z.email("Please enter a valid email address."),
        phone: z
            .string()
            .trim()
            .refine((value) => value.replace(/\D/g, "").length >= 10, "Please enter a 10-digit phone number."),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .regex(/[A-Za-z]/, "Password must include a letter.")
            .regex(/\d/, "Password must include a number."),
        confirmPassword: z.string().min(1, "Please confirm your password."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

type SignUpInputs = z.infer<typeof signUpSchema>;

const PROTOTYPE_CODE = "123456";

// -------------------------------------------
// Sign-Up Page
// -------------------------------------------
const SignUpPageContent = () => {
    const [step, setStep] = useState<"signup" | "verify" | "success">("signup");
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState("");
    const [resendMessage, setResendMessage] = useState("");
    const [pending, setPending] = useState<SignUpInputs | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpInputs>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" },
    });

    const field = (name: keyof SignUpInputs) => ({
        id: name,
        "aria-invalid": !!errors[name],
        "aria-describedby": errors[name] ? `${name}-error` : undefined,
    });

    const errorText = (name: keyof SignUpInputs) =>
        errors[name] && (
            <p id={`${name}-error`} role="alert" className="form-error">
                {errors[name]?.message}
            </p>
        );

    const onSubmit = (data: SignUpInputs) => {
        // Never log form data: it contains the password.
        // Prototype only — a real application creates the Firebase user here.
        setPending(data);
        setStep("verify");
    };

    // -------------------------------------------
    // Fake 2FA verification (prototype code is 123456)
    // -------------------------------------------
    const handleVerify = (event: React.FormEvent) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(verificationCode)) {
            setVerificationError("Enter the 6-digit code from your email.");
            return;
        }
        if (verificationCode !== PROTOTYPE_CODE || !pending) {
            setVerificationError("Incorrect verification code. Check the code and try again.");
            return;
        }
        setVerificationError("");
        // Passwords are not stored in the browser; only profile details are kept.
        saveProfile({
            firstName: pending.firstName,
            lastName: pending.lastName,
            email: pending.email,
            phone: pending.phone,
        });
        signIn(pending.email);
        setStep("success");
    };

    // -------------------------------------------
    // Sign-up screen
    // -------------------------------------------
    if (step === "signup") {
        return (
            <AuthShell title="Create an account" subtitle="Create an account to book and manage your appointments.">
                <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="firstName" className="form-label">First name</label>
                            <input {...register("firstName")} {...field("firstName")} type="text" autoComplete="given-name" className="form-input" />
                            {errorText("firstName")}
                        </div>
                        <div>
                            <label htmlFor="lastName" className="form-label">Last name</label>
                            <input {...register("lastName")} {...field("lastName")} type="text" autoComplete="family-name" className="form-input" />
                            {errorText("lastName")}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="form-label">Email</label>
                        <input {...register("email")} {...field("email")} type="email" autoComplete="email" placeholder="you@example.com" className="form-input" />
                        {errorText("email")}
                    </div>

                    <div>
                        <label htmlFor="phone" className="form-label">Phone number</label>
                        <input {...register("phone")} {...field("phone")} type="tel" autoComplete="tel" placeholder="(403) 555-0123" className="form-input" />
                        {errorText("phone")}
                    </div>

                    <div>
                        <label htmlFor="password" className="form-label">Password</label>
                        <PasswordInput {...register("password")} {...field("password")} autoComplete="new-password" />
                        {errors.password ? (
                            errorText("password")
                        ) : (
                            <p className="mt-1.5 text-sm text-ink-soft">At least 8 characters, with a letter and a number.</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
                        <PasswordInput {...register("confirmPassword")} {...field("confirmPassword")} autoComplete="new-password" />
                        {errorText("confirmPassword")}
                    </div>

                    <button type="submit" className="primary-button">Create account</button>
                </form>

                <p className="mt-6 text-center text-sm text-ink-soft">
                    Already have an account?{" "}
                    <Link href="/signin" className="font-semibold text-brand-700 hover:underline">Sign in</Link>
                </p>
            </AuthShell>
        );
    }

    // ----------------------------------------------------
    // 2FA verification screen
    // ----------------------------------------------------
    if (step === "verify") {
        return (
            <AuthShell
                title="Verify your account"
                subtitle={
                    <>
                        We sent a 6-digit verification code to{" "}
                        <strong className="text-ink">{pending?.email}</strong>
                    </>
                }
            >
                <form noValidate onSubmit={handleVerify}>
                    <label htmlFor="verification-code" className="form-label">Verification code</label>
                    <input
                        id="verification-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))}
                        aria-invalid={!!verificationError}
                        aria-describedby={verificationError ? "code-error" : undefined}
                        className="form-input figures text-center text-2xl tracking-[0.4em]"
                    />
                    {verificationError && (
                        <p id="code-error" role="alert" className="form-error">{verificationError}</p>
                    )}

                    <button type="submit" className="primary-button mt-6">Verify account</button>
                </form>

                <div className="mt-4 flex flex-col items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setResendMessage(`A new code was sent to ${pending?.email}.`)}
                        className="text-sm font-semibold text-brand-700 hover:underline"
                    >
                        Resend code
                    </button>
                    <p role="status" className="text-sm text-ink-soft">{resendMessage}</p>
                    <button
                        type="button"
                        onClick={() => setStep("signup")}
                        className="text-sm font-semibold text-brand-700 hover:underline"
                    >
                        Use a different email
                    </button>
                </div>

                <p className="mt-5 text-center text-xs text-ink-soft">Prototype verification code: {PROTOTYPE_CODE}</p>
            </AuthShell>
        );
    }

    // ----------------------------------------------------
    // Success screen
    // ----------------------------------------------------
    return (
        <AuthShell title="Account verified" subtitle="Your account has been created and you are signed in.">
            <div role="status" className="text-center">
                <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-700">
                    <svg viewBox="0 0 20 20" className="h-8 w-8" aria-hidden="true">
                        <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <Link href="/booking" className="primary-button">Continue to booking</Link>
                <Link href="/account" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
                    Go to my appointments
                </Link>
            </div>
        </AuthShell>
    );
};



export default function SignUpPage() {
    return (
        <FreshOnVisit>
            <SignUpPageContent />
        </FreshOnVisit>
    );
}
