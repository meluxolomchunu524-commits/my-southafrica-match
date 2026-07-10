import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Users, Shield, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About LoveConnect SA — Our Story" },
      { name: "description", content: "Learn how LoveConnect SA is helping South Africans find genuine, lasting relationships in a safe modern dating community." },
      { property: "og:title", content: "About LoveConnect SA" },
      { property: "og:description", content: "Our mission: real love, safely, for every South African single." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero eyebrow="About us" title="Built for South African hearts." subtitle="LoveConnect SA started with one belief — that meaningful love shouldn't be lost in an endless feed of swipes." />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-6 text-lg leading-relaxed text-foreground/85">
        <p>
          Founded in Cape Town in 2024, LoveConnect SA is a proudly local dating platform built by South Africans, for South Africans. We saw too many singles frustrated by shallow apps that felt more like games than real connection — so we set out to build something better.
        </p>
        <p>
          Today, over 250,000 members from every province trust us to introduce them to people who actually match who they are — their culture, values, ambitions, and yes, sense of humour. Every profile is manually verified, every report is answered by a real person, and every feature is designed to move you from screen to real life.
        </p>
      </section>

      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { icon: Users, n: "250k+", label: "Members across SA" },
              { icon: Heart, n: "18k", label: "Matches every month" },
              { icon: Shield, n: "100%", label: "Verified profiles" },
              { icon: Award, n: "4.8★", label: "Average rating" },
            ].map((s) => (
              <div key={s.label} className="rounded-3xl bg-card border border-border p-8 text-center shadow-soft">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand">
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <p className="mt-4 font-display text-3xl font-bold">{s.n}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            { title: "Our mission", body: "Help every South African single find a partner who truly gets them — safely, respectfully, and joyfully." },
            { title: "Our values", body: "Consent, verification, and community first. We build features that make dating feel human, not algorithmic." },
            { title: "Our promise", body: "We will never sell your data. We will always show up when you need us. And we'll keep celebrating your love stories." },
          ].map((v) => (
            <div key={v.title}>
              <h3 className="font-display text-2xl font-bold text-gradient-brand">{v.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link to="/signup" className="inline-flex rounded-full bg-gradient-brand px-7 py-4 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
            Join LoveConnect SA — it's free
          </Link>
        </div>
      </section>
    </>
  );
}

export function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <section className="bg-gradient-brand text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">{eyebrow}</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl font-bold leading-tight">{title}</h1>
        <p className="mt-5 mx-auto max-w-2xl text-lg text-white/90">{subtitle}</p>
      </div>
    </section>
  );
}
