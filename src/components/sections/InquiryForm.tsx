"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonAction } from "@/components/ui/Button";
import { inquirySubjects, inquiryTypes } from "@/data/about";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const field =
  "w-full rounded-xl border border-forest-600/15 bg-cream-50 px-4 py-3 text-sm text-forest-900 outline-none transition-colors placeholder:text-forest-900/35 focus:border-forest-600/45";

/**
 * Tabbed enquiry form, mirroring the mockups' General / Investment / Booking
 * tabs — retargeted to what this site actually does: ownership, general and
 * partnership enquiries.
 */
export function InquiryForm() {
  const [type, setType] = useState<string>(inquiryTypes[0].id);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [note, setNote] = useState<string>("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrors(json.errors ?? {});
        setNote(json.error ?? "Please check the highlighted fields.");
        setStatus("error");
        return;
      }

      setNote(json.message);
      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setNote("Something went wrong. Please call or email us instead.");
      setStatus("error");
    }
  }

  const activeType = inquiryTypes.find((t) => t.id === type);

  return (
    <div className="rounded-3xl border border-forest-600/10 bg-cream-100 p-6 shadow-lift sm:p-8">
      <h2 className="font-display text-display-sm text-forest-900">
        Send us a message
      </h2>
      <p className="mt-2 text-[0.8125rem] text-forest-900/55">
        Tell us what you need and the AVEN team will reply within 24 hours.
      </p>

      {/* Type tabs */}
      <div
        role="tablist"
        aria-label="Enquiry type"
        className="mt-6 flex flex-wrap gap-2"
      >
        {inquiryTypes.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={type === t.id}
            onClick={() => setType(t.id)}
            className={cn(
              "rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors",
              type === t.id
                ? "bg-forest-600 text-cream-50"
                : "bg-forest-600/7 text-forest-800/75 hover:bg-forest-600/12",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {activeType && (
        <p className="mt-3 text-xs italic text-forest-900/45">
          {activeType.blurb}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
        {/* Honeypot */}
        <div aria-hidden="true" className="absolute left-[-9999px]">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Full name" error={errors.name}>
            <input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Enter your full name"
              className={field}
            />
          </Field>
          <Field id="email" label="Email address" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className={field}
            />
          </Field>
          <Field id="phone" label="Phone number" error={errors.phone}>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              className={field}
            />
          </Field>
          <Field id="subject" label="Subject">
            <select id="subject" name="subject" className={field} defaultValue="">
              <option value="" disabled>
                Select a subject
              </option>
              {inquirySubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field id="message" label="Message" error={errors.message}>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Tell us how we can help…"
            className={cn(field, "resize-y")}
          />
        </Field>

        <ButtonAction
          type="submit"
          size="lg"
          disabled={status === "submitting"}
          className="w-full"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </ButtonAction>

        <AnimatePresence>
          {(status === "success" || status === "error") && note && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: easeOutExpo }}
              role="status"
              className={cn(
                "rounded-xl px-4 py-3 text-[0.8125rem]",
                status === "success"
                  ? "bg-forest-600/10 text-forest-700"
                  : "bg-gold-500/12 text-gold-600",
              )}
            >
              {note}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="text-xs leading-relaxed text-forest-900/40">
          Enquiries are handled by the AVEN team directly. This site does not
          take bookings or payments.
        </p>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[0.75rem] font-medium text-forest-900/70"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-gold-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
