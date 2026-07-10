import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { PageHero } from "./about";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact LoveConnect SA" },
      { name: "description", content: "Get in touch with the LoveConnect SA team. We're here to help with support, safety, and partnership queries." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact us" title="We'd love to hear from you." subtitle="Support, safety, partnerships, press — reach us and a real human will respond within 24 hours." />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          {[
            { icon: Mail, title: "Email", body: "hello@loveconnect.co.za" },
            { icon: Phone, title: "Phone", body: "+27 21 555 0100" },
            { icon: MapPin, title: "Office", body: "12 Bree Street, Cape Town, 8001" },
          ].map((c) => (
            <div key={c.title} className="flex gap-4 rounded-3xl border border-border bg-card p-6">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand shadow-soft">
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-display font-semibold">{c.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              </div>
            </div>
          ))}
          <div className="overflow-hidden rounded-3xl border border-border h-64">
            <iframe
              title="Office location"
              className="h-full w-full"
              src="https://www.openstreetmap.org/export/embed.html?bbox=18.415%2C-33.925%2C18.425%2C-33.915&layer=mapnik"
              loading="lazy"
            />
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="lg:col-span-3 rounded-3xl border border-border bg-card p-8 shadow-soft space-y-5">
          <h2 className="font-display text-2xl font-bold">Send a message</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" type="text" placeholder="Thandi Nkosi" />
            <Field label="Email" type="email" placeholder="you@example.com" />
          </div>
          <Field label="Subject" type="text" placeholder="How can we help?" />
          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea rows={5} required placeholder="Tell us more…" className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
            <Send className="h-4 w-4" /> Send message
          </button>
        </form>
      </section>
    </>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input required {...rest} className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}
