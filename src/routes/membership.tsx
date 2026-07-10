import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Star } from "lucide-react";
import { PageHero } from "./about";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership Plans — LoveConnect SA" },
      { name: "description", content: "Free, Premium, and VIP membership plans for South African singles serious about love." },
    ],
  }),
  component: Membership,
});

const plans = [
  {
    name: "Free", price: "R0",
    desc: "Start meeting people today.",
    features: ["Create your profile", "Browse members", "5 likes per day", "Basic search filters"],
  },
  {
    name: "Premium", price: "R199", highlight: true,
    desc: "For singles ready to connect.",
    features: ["Unlimited likes", "Unlimited messaging", "See who liked you", "Priority profile placement", "Advanced filters"],
  },
  {
    name: "VIP", price: "R399",
    desc: "The full LoveConnect experience.",
    features: ["Everything in Premium", "Verified badge", "Video calls", "Profile boost 5x weekly", "Priority support"],
  },
];

function Membership() {
  return (
    <>
      <PageHero eyebrow="Membership" title="Pick a plan. Find your person." subtitle="Every plan is month-to-month. Cancel anytime, no questions asked." />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-3xl p-8 transition-all ${
              p.highlight ? "bg-gradient-brand text-white shadow-glow md:scale-105" : "bg-card border border-border hover:shadow-soft"
            }`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple">
                  <Star className="inline h-3 w-3 mr-1" fill="currentColor" /> Most popular
                </span>
              )}
              <h3 className="font-display text-2xl font-bold">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.highlight ? "text-white/80" : "text-muted-foreground"}`}>{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{p.price}</span>
                <span className={`text-sm ${p.highlight ? "text-white/70" : "text-muted-foreground"}`}>/month</span>
              </div>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={`h-5 w-5 shrink-0 ${p.highlight ? "text-white" : "text-pink"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition ${
                p.highlight ? "bg-white text-purple hover:scale-105" : "bg-gradient-brand text-white hover:shadow-soft"
              }`}>
                Choose {p.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center">Frequently asked</h2>
          <div className="mt-8 space-y-4">
            {[
              ["Can I cancel anytime?", "Yes — one tap in your account settings, no penalties, no phone calls."],
              ["Do you offer refunds?", "If you cancel within 7 days of a new subscription and haven't used premium features, we'll refund you in full."],
              ["Which payment methods do you accept?", "All major SA cards, Instant EFT, SnapScan, and Ozow."],
            ].map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
                  {q}
                  <span className="text-pink group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
