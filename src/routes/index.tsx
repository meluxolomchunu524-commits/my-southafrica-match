import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart, Shield, Sparkles, Users, MessageCircle, Star, Check,
  Smartphone, Apple, ArrowRight, MapPin, Quote,
} from "lucide-react";
import heroImg from "@/assets/hero-couple.jpg";
import member1 from "@/assets/member-1.jpg";
import member2 from "@/assets/member-2.jpg";
import member3 from "@/assets/member-3.jpg";
import member4 from "@/assets/member-4.jpg";
import success1 from "@/assets/success-1.jpg";
import success2 from "@/assets/success-2.jpg";
import success3 from "@/assets/success-3.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Happy South African couple laughing together at sunset"
            width={1600}
            height={1200}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero-overlay)" }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-36 lg:py-44 text-white">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-xs font-medium uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> South Africa's #1 dating platform
            </span>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05]">
              Find Your Perfect Match Today <span className="inline-block animate-float">❤️</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/90 leading-relaxed">
              Join thousands of singles looking for meaningful relationships across
              South Africa — from Cape Town to Durban, Joburg to Polokwane.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-purple shadow-glow hover:scale-[1.03] transition-transform"
              >
                Join Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/matches"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 backdrop-blur bg-white/10 px-7 py-4 text-base font-semibold text-white hover:bg-white/20 transition"
              >
                Browse Matches
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap gap-8 text-sm">
              <Stat n="250k+" label="Active members" />
              <Stat n="18k+" label="Matches monthly" />
              <Stat n="4.8★" label="Member rating" />
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <Section eyebrow="Why LoveConnect SA" title="Real people. Real connections. Really safe.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Shield, title: "Verified profiles", body: "Every profile is manually reviewed and photo-verified." },
            { icon: Sparkles, title: "Smart matching", body: "Our algorithm learns what you love and surfaces real compatibility." },
            { icon: Users, title: "SA-first community", body: "Built for South Africans, in every province and language." },
            { icon: MessageCircle, title: "Meaningful chat", body: "Icebreakers, prompts, and video calls — beyond swiping." },
          ].map((f) => (
            <div key={f.title} className="group rounded-3xl border border-border bg-card p-7 hover:shadow-soft hover:-translate-y-1 transition-all">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand shadow-soft">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SUCCESS STORIES */}
      <Section eyebrow="Success stories" title="Love that started here." tone="soft">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { img: success1, names: "Thandi & Sipho", city: "Cape Town", quote: "We matched on a Tuesday. Six months later he proposed on the same beach." },
            { img: success2, names: "Naledi & Kagiso", city: "Johannesburg", quote: "LoveConnect made it easy to skip the games and just talk like real people." },
            { img: success3, names: "Zola & Marcus", city: "Stellenbosch", quote: "Married in a vineyard 14 months after our first chat. Best swipe of my life." },
          ].map((s) => (
            <article key={s.names} className="overflow-hidden rounded-3xl bg-card border border-border shadow-soft hover:shadow-glow transition-shadow">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={s.img} alt={s.names} loading="lazy" width={1200} height={900} className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <Quote className="h-6 w-6 text-pink" />
                <p className="mt-3 text-sm leading-relaxed">"{s.quote}"</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-display font-semibold">{s.names}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {s.city}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* FEATURED MEMBERS */}
      <Section eyebrow="Featured members" title="Meet singles near you.">
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {[
            { img: member1, name: "Ayanda", age: 27, city: "Durban" },
            { img: member2, name: "Lebo", age: 31, city: "Pretoria" },
            { img: member3, name: "Nomsa", age: 25, city: "Cape Town" },
            { img: member4, name: "Themba", age: 29, city: "Johannesburg" },
          ].map((m) => (
            <div key={m.name} className="group relative overflow-hidden rounded-3xl shadow-soft">
              <img src={m.img} alt={m.name} loading="lazy" width={800} height={1000} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display text-xl font-semibold">{m.name}, {m.age}</p>
                    <p className="text-xs text-white/80 inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{m.city}</p>
                  </div>
                  <button className="grid h-11 w-11 place-items-center rounded-full bg-gradient-brand shadow-soft hover:scale-110 transition-transform" aria-label={`Like ${m.name}`}>
                    <Heart className="h-5 w-5 text-white" fill="white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/matches" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
            Browse all members <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* MEMBERSHIP */}
      <Section eyebrow="Membership plans" title="Choose the love you deserve." tone="soft">
        <div className="grid gap-6 md:grid-cols-3">
          <Plan
            name="Free"
            price="R0"
            desc="Everything you need to start."
            features={["Create your profile", "Browse members", "5 likes per day", "Basic search"]}
          />
          <Plan
            name="Premium"
            price="R199"
            highlight
            desc="For serious singles ready to connect."
            features={["Unlimited likes", "Unlimited messaging", "See who liked you", "Priority profile placement"]}
          />
          <Plan
            name="VIP"
            price="R399"
            desc="The full LoveConnect experience."
            features={["Everything in Premium", "Profile verification badge", "Video calls", "Advanced search & profile boost"]}
          />
        </div>
      </Section>

      {/* SAFETY TIPS */}
      <Section eyebrow="Your safety, first" title="Date smart. Date safe.">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Keep it on-platform", body: "Chat inside LoveConnect until you're 100% comfortable — your data stays private." },
            { title: "Meet in public first", body: "Coffee shops, restaurants, daylight venues. Tell a friend where you'll be." },
            { title: "Report anything off", body: "One tap to report or block. Our team responds within 12 hours, day or night." },
          ].map((t) => (
            <div key={t.title} className="rounded-3xl border border-border bg-card p-7">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blush">
                <Shield className="h-5 w-5 text-purple" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* MOBILE APP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-brand p-10 md:p-16 text-white shadow-glow">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-purple/40 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Coming soon</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold leading-tight">
                Take LoveConnect anywhere.
              </h2>
              <p className="mt-4 max-w-md text-white/90 leading-relaxed">
                Chat, match, and meet on the go. Our mobile app launches later this year — get notified first.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-3 rounded-2xl bg-ink px-5 py-3 hover:scale-105 transition-transform">
                  <Apple className="h-6 w-6" />
                  <span className="text-left">
                    <span className="block text-[10px] uppercase opacity-70">Download on the</span>
                    <span className="block text-sm font-semibold">App Store</span>
                  </span>
                </button>
                <button className="inline-flex items-center gap-3 rounded-2xl bg-ink px-5 py-3 hover:scale-105 transition-transform">
                  <Smartphone className="h-6 w-6" />
                  <span className="text-left">
                    <span className="block text-[10px] uppercase opacity-70">Get it on</span>
                    <span className="block text-sm font-semibold">Google Play</span>
                  </span>
                </button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="animate-float rounded-[3rem] bg-white/10 backdrop-blur p-6 border border-white/20">
                <Heart className="h-40 w-40 text-white" fill="white" strokeWidth={0.5} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          Love notes, <span className="text-gradient-brand">straight to your inbox.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Dating tips, success stories, and member spotlights. No spam. Ever.
        </p>
        <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-full border border-border bg-background px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
            Subscribe
          </button>
        </form>
      </section>
    </>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold">{n}</p>
      <p className="text-xs text-white/70 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function Section({
  eyebrow, title, children, tone,
}: {
  eyebrow: string; title: string; children: React.ReactNode; tone?: "soft";
}) {
  return (
    <section className={tone === "soft" ? "bg-gradient-soft" : ""}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink">{eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold leading-tight">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Plan({
  name, price, desc, features, highlight,
}: {
  name: string; price: string; desc: string; features: string[]; highlight?: boolean;
}) {
  return (
    <div className={`relative rounded-3xl p-8 transition-all ${
      highlight
        ? "bg-gradient-brand text-white shadow-glow scale-[1.02]"
        : "bg-card border border-border hover:shadow-soft"
    }`}>
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple">
          <Star className="inline h-3 w-3 mr-1" fill="currentColor" /> Most popular
        </span>
      )}
      <h3 className="font-display text-2xl font-bold">{name}</h3>
      <p className={`mt-1 text-sm ${highlight ? "text-white/80" : "text-muted-foreground"}`}>{desc}</p>
      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-display text-5xl font-bold">{price}</span>
        <span className={`text-sm ${highlight ? "text-white/70" : "text-muted-foreground"}`}>/month</span>
      </div>
      <ul className="mt-8 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <Check className={`h-5 w-5 shrink-0 ${highlight ? "text-white" : "text-pink"}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/signup"
        className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition ${
          highlight
            ? "bg-white text-purple hover:scale-105"
            : "bg-gradient-brand text-white hover:shadow-soft"
        }`}
      >
        Get started
      </Link>
    </div>
  );
}
