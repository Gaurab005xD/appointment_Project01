"use client";

import FreshOnVisit from "@/components/fresh-on-visit";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactSchema = z.object({
    name: z.string().trim().min(2, "Enter your name."),
    email: z.email("Enter a valid email address, like name@example.com."),
    phone: z
        .string()
        .trim()
        .refine(
            (value) => value === "" || value.replace(/\D/g, "").length >= 10,
            "Enter a 10-digit phone number, or leave it blank."
        ),
    topic: z.string().min(1, "Choose what your message is about."),
    message: z
        .string()
        .trim()
        .min(10, "Add a little more detail (at least 10 characters).")
        .max(1000, "Keep your message under 1,000 characters."),
    // Honeypot: hidden from people, bots tend to fill it in
    website: z.string().max(0).optional(),
});

type ContactInputs = z.infer<typeof contactSchema>;

const topics = ["A question before booking", "An existing appointment", "Documents or CRA letters", "Something else"];

function ContactFormContent() {
    const [sentTo, setSentTo] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ContactInputs>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: "", email: "", phone: "", topic: "", message: "", website: "" },
    });

    const messageLength = useWatch({ control, name: "message" })?.length ?? 0;

    const onSubmit = async (data: ContactInputs) => {
        // Prototype: a real app posts to an API route that emails the accountant.
        await new Promise((resolve) => setTimeout(resolve, 400));
        setSentTo(data.email);
        reset();
    };

    if (sentTo) {
        return (
            <div role="status" className="panel p-8">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-brand-700">
                    <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden="true">
                        <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold">Message sent</h2>
                <p className="mt-2 leading-7 text-ink-soft">
                    Thanks. Abdullatif will reply to <strong className="text-ink">{sentTo}</strong> within one business day.
                    This prototype does not send email.
                </p>
                <button type="button" className="secondary-button mt-6" onClick={() => setSentTo(null)}>
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="panel space-y-5 p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="contact-name" className="form-label">Name</label>
                    <input id="contact-name" autoComplete="name" className="form-input" {...register("name")}
                        aria-invalid={!!errors.name} aria-describedby={errors.name ? "contact-name-error" : undefined} />
                    {errors.name && <p id="contact-name-error" className="form-error">{errors.name.message}</p>}
                </div>
                <div>
                    <label htmlFor="contact-email" className="form-label">Email</label>
                    <input id="contact-email" type="email" autoComplete="email" className="form-input" {...register("email")}
                        aria-invalid={!!errors.email} aria-describedby={errors.email ? "contact-email-error" : undefined} />
                    {errors.email && <p id="contact-email-error" className="form-error">{errors.email.message}</p>}
                </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="contact-phone" className="form-label">
                        Phone <span className="font-normal text-ink-soft">(optional)</span>
                    </label>
                    <input id="contact-phone" type="tel" autoComplete="tel" className="form-input" {...register("phone")}
                        aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "contact-phone-error" : undefined} />
                    {errors.phone && <p id="contact-phone-error" className="form-error">{errors.phone.message}</p>}
                </div>
                <div>
                    <label htmlFor="contact-topic" className="form-label">Topic</label>
                    <select id="contact-topic" className="form-input" {...register("topic")}
                        aria-invalid={!!errors.topic} aria-describedby={errors.topic ? "contact-topic-error" : undefined}>
                        <option value="">Choose a topic</option>
                        {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.topic && <p id="contact-topic-error" className="form-error">{errors.topic.message}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="contact-message" className="form-label">Message</label>
                <textarea id="contact-message" rows={6} maxLength={1000} className="form-input" {...register("message")}
                    aria-invalid={!!errors.message}
                    aria-describedby={`contact-message-count${errors.message ? " contact-message-error" : ""}`} />
                <div className="flex justify-between gap-4">
                    {errors.message ? <p id="contact-message-error" className="form-error">{errors.message.message}</p> : <span />}
                    <p id="contact-message-count" className="figures mt-1.5 text-sm text-ink-soft">{messageLength}/1000</p>
                </div>
            </div>

            {/* Spam protection honeypot */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="contact-website">Leave this field empty</label>
                <input id="contact-website" tabIndex={-1} autoComplete="off" {...register("website")} />
            </div>

            <p className="text-sm text-ink-soft">
                Please don&apos;t include your SIN or banking details. We will ask for those securely if needed.
            </p>

            <button type="submit" className="primary-button sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send message"}
            </button>
        </form>
    );
}

export default function ContactForm() {
    return (
        <FreshOnVisit>
            <ContactFormContent />
        </FreshOnVisit>
    );
}
