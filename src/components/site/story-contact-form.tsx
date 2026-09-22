"use client";

import { useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { SelectField, TextAreaField, TextField } from "@/components/ui/forms";
import { Button, Callout, ErrorState, Panel } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";

/**
 * UI only. Nothing is sent anywhere — there is no API route, no mail
 * service and no stored submission in this prototype.
 */

const SUBJECTS = [
  { value: "", label: "Select a subject" },
  { value: "general", label: "General question" },
  { value: "order", label: "A problem with an order" },
  { value: "allergens", label: "Allergens and ingredients" },
  { value: "large", label: "Large or catering order" },
  { value: "booth", label: "Photo booth" },
  { value: "feedback", label: "Feedback or a compliment" },
  { value: "careers", label: "Working with us" },
];

interface Errors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm() {
  const { sim } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [reference, setReference] = useState("");

  const validate = (): Errors => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Enter the name we should reply to.";
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter an email address we can reply to, like you@example.com.";
    if (!subject) next.subject = "Choose the subject that fits best.";
    if (message.trim().length < 20)
      next.message = "Tell us a little more — at least 20 characters so we can help properly.";
    return next;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById("contact-error-summary")?.focus();
      return;
    }

    setState("sending");
    window.setTimeout(() => {
      // Simulated outcome: the offline switch in the prototype panel fails the send.
      if (sim.offline) {
        setReference(`MSG-ERR-${Math.random().toString(16).slice(2, 8).toUpperCase()}`);
        setState("failed");
        return;
      }
      setReference(`MSG-${Math.random().toString(16).slice(2, 8).toUpperCase()}`);
      setState("sent");
    }, 900);
  };

  const reset = () => {
    setState("idle");
    setErrors({});
  };

  if (state === "sent") {
    return (
      <Panel className="p-6 lg:p-8">
        <div className="flex flex-col items-start gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-mint text-deep">
            <Icon name="check" size={22} />
          </span>
          <h3 className="text-[22px]">Message sent</h3>
          <p className="max-w-[52ch] text-[15px] leading-relaxed text-ink/80">
            Thanks {name.split(" ")[0]}. We reply to messages between 10:00 and 20:00, usually
            within one working day. If it is about an order happening right now, please call the
            branch instead — it is much faster.
          </p>
          <p className="num text-[13px] text-grey">
            Your reference: <span className="font-semibold text-ink">{reference}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setName("");
                setEmail("");
                setSubject("");
                setMessage("");
                reset();
              }}
            >
              Send another message
            </Button>
          </div>
          <p className="mt-2 text-[12px] text-grey">
            Prototype only — no message leaves the browser.
          </p>
        </div>
      </Panel>
    );
  }

  if (state === "failed") {
    return (
      <Panel className="p-6 lg:p-8">
        <ErrorState
          title="We could not send your message"
          body="You appear to be offline, so the message was not sent. Your text is still here — reconnect and try again, or call the branch directly."
          requestId={reference}
          onRetry={reset}
          retryLabel="Back to the form"
        />
      </Panel>
    );
  }

  const errorList = Object.entries(errors) as [keyof Errors, string][];

  return (
    <Panel className="p-6 lg:p-8">
      <h3 className="text-[22px]">Send us a message</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-grey">
        We read everything. For anything urgent about an order in progress, call the branch.
      </p>

      {errorList.length > 0 && (
        <div
          id="contact-error-summary"
          tabIndex={-1}
          role="alert"
          className="mt-5 rounded-[14px] border border-cta/35 bg-cta/8 p-4"
        >
          <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Icon name="alert" size={17} />
            There {errorList.length === 1 ? "is 1 problem" : `are ${errorList.length} problems`} with
            this form
          </p>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-[14px] text-ink/80">
            {errorList.map(([key, text]) => (
              <li key={key}>{text}</li>
            ))}
          </ul>
        </div>
      )}

      <form noValidate onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Your name"
            required
            autoComplete="name"
            value={name}
            error={errors.name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email address"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            hint="We only use this to reply."
            value={email}
            error={errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <SelectField
          label="Subject"
          required
          options={SUBJECTS}
          value={subject}
          error={errors.subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <TextAreaField
          label="Message"
          required
          showCount
          maxLength={800}
          rows={6}
          hint="Include your order code if you have one."
          value={message}
          error={errors.message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {sim.offline && (
          <Callout tone="warning" icon="wifiOff" title="You are offline">
            Sending is paused until you reconnect. Nothing you have typed will be lost.
          </Callout>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" loading={state === "sending"} iconEnd="arrowRight">
            {state === "sending" ? "Sending" : "Send message"}
          </Button>
          <p className="text-[13px] text-grey">
            By sending this you agree to our{" "}
            <a href="/legal/privacy" className="font-semibold text-deep underline underline-offset-2">
              privacy policy
            </a>
            .
          </p>
        </div>
      </form>
    </Panel>
  );
}
