import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, Filter, Search } from "lucide-react";
import { PageHero } from "./about";
import m1 from "@/assets/member-1.jpg";
import m2 from "@/assets/member-2.jpg";
import m3 from "@/assets/member-3.jpg";
import m4 from "@/assets/member-4.jpg";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Find Matches — LoveConnect SA" },
      { name: "description", content: "Browse verified singles across South Africa. Filter by city, age, and interests to find your perfect match." },
    ],
  }),
  component: Matches,
});

const people = [
  { img: m1, name: "Ayanda", age: 27, city: "Durban", tag: "Traveller" },
  { img: m2, name: "Lebo", age: 31, city: "Pretoria", tag: "Coffee lover" },
  { img: m3, name: "Nomsa", age: 25, city: "Cape Town", tag: "Musician" },
  { img: m4, name: "Themba", age: 29, city: "Joburg", tag: "Foodie" },
  { img: m1, name: "Zinhle", age: 26, city: "Port Elizabeth", tag: "Runner" },
  { img: m2, name: "Bongani", age: 33, city: "Bloemfontein", tag: "Reader" },
  { img: m3, name: "Karabo", age: 28, city: "Polokwane", tag: "Hiker" },
  { img: m4, name: "Sipho", age: 30, city: "East London", tag: "Photographer" },
];

function Matches() {
  return (
    <>
      <PageHero eyebrow="Find matches" title="Your next great love, just a scroll away." subtitle="Real, verified singles from every corner of South Africa." />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl border border-border bg-card p-4 md:p-6 shadow-soft flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 rounded-2xl bg-muted px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search by name or city…" className="flex-1 bg-transparent text-sm focus:outline-none" />
          </div>
          <select className="rounded-2xl bg-muted px-4 py-3 text-sm">
            <option>Any gender</option><option>Women</option><option>Men</option><option>Non-binary</option>
          </select>
          <select className="rounded-2xl bg-muted px-4 py-3 text-sm">
            <option>Any province</option><option>Gauteng</option><option>Western Cape</option><option>KZN</option><option>Eastern Cape</option>
          </select>
          <button className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>

        <div className="mt-10 grid gap-5 grid-cols-2 lg:grid-cols-4">
          {people.map((p, i) => (
            <div key={i} className="group relative overflow-hidden rounded-3xl shadow-soft">
              <img src={p.img} alt={p.name} loading="lazy" width={800} height={1000} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <span className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[11px] font-semibold text-purple">
                {p.tag}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white flex items-end justify-between">
                <div>
                  <p className="font-display text-xl font-semibold">{p.name}, {p.age}</p>
                  <p className="text-xs text-white/80 inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city}</p>
                </div>
                <button className="grid h-11 w-11 place-items-center rounded-full bg-gradient-brand shadow-soft hover:scale-110 transition-transform" aria-label={`Like ${p.name}`}>
                  <Heart className="h-5 w-5 text-white" fill="white" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/signup" className="inline-flex rounded-full bg-gradient-brand px-7 py-4 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
            Create a free profile to connect
          </Link>
        </div>
      </section>
    </>
  );
}
