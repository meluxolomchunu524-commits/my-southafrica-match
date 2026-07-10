import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Check, Heart, ImagePlus, MapPin, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Edit your profile — LoveConnect SA" },
      { name: "description", content: "Set up and manage your LoveConnect SA profile: photos, bio, interests, and preferences." },
      { property: "og:title", content: "Edit your profile — LoveConnect SA" },
      { property: "og:description", content: "Curate the profile South Africa's singles will see." },
    ],
  }),
  component: ProfilePage,
});

const provinces = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Free State","Limpopo","Mpumalanga","North West","Northern Cape"];
const suggestedInterests = ["Hiking","Braai","Wine tasting","Jazz","Afrobeats","Travel","Yoga","Reading","Cooking","Photography","Rugby","Movies","Art","Coffee","Volunteering","Gaming"];

function ProfilePage() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>(["Hiking","Jazz","Travel"]);
  const [interestInput, setInterestInput] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  function readFile(file: File, setter: (v: string) => void) {
    const r = new FileReader();
    r.onload = () => setter(r.result as string);
    r.readAsDataURL(file);
  }

  function toggleInterest(t: string) {
    setInterests((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  function addInterest() {
    const v = interestInput.trim();
    if (v && !interests.includes(v) && interests.length < 12) {
      setInterests([...interests, v]);
      setInterestInput("");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <SiteNav />
      <main className="pt-16 bg-gradient-soft min-h-screen">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-pink">Your profile</p>
              <h1 className="mt-1 font-display text-4xl sm:text-5xl font-bold">Make a great first impression</h1>
              <p className="mt-2 text-muted-foreground max-w-xl">Genuine photos and an honest bio get the best matches. You can update anything below at any time.</p>
            </div>
            <Link to="/matches" className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-muted transition">
              View as others see it
            </Link>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-8">
            {/* Cover + Avatar */}
            <div className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden">
              <div
                className="relative h-48 sm:h-64 bg-gradient-brand"
                style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                <button
                  type="button"
                  onClick={() => coverRef.current?.click()}
                  className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur px-4 py-2 text-xs font-semibold text-white hover:bg-black/70 transition"
                >
                  <ImagePlus className="h-4 w-4" /> {cover ? "Change cover" : "Add cover photo"}
                </button>
                <input ref={coverRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], setCover)} />
              </div>

              <div className="px-6 sm:px-8 pb-6 -mt-16 flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-muted ring-4 ring-background overflow-hidden grid place-items-center shadow-glow"
                       style={avatar ? { backgroundImage: `url(${avatar})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                    {!avatar && <Heart className="h-8 w-8 text-pink" fill="currentColor" />}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarRef.current?.click()}
                    aria-label="Upload profile photo"
                    className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-white shadow-soft hover:shadow-glow transition"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], setAvatar)} />
                </div>

                <div className="flex-1 sm:pb-2">
                  <h2 className="font-display text-2xl font-bold">Thandi Nkosi</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Cape Town, Western Cape</p>
                </div>

                <div className="sm:pb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-purple">
                    <Sparkles className="h-3 w-3" /> 60% complete
                  </span>
                </div>
              </div>
            </div>

            {/* Basic info */}
            <Section title="Basic information" subtitle="How you'll appear across LoveConnect SA.">
              <Grid>
                <Field label="Display name" defaultValue="Thandi Nkosi" />
                <Field label="Username" defaultValue="thandi_n" />
              </Grid>
              <Grid>
                <Field label="Date of birth" type="date" defaultValue="1996-05-14" />
                <Select label="Gender" defaultValue="Woman" options={["Woman","Man","Non-binary","Prefer not to say"]} />
              </Grid>
              <Grid>
                <Select label="Province" defaultValue="Western Cape" options={provinces} />
                <Field label="City" defaultValue="Cape Town" />
              </Grid>
            </Section>

            {/* About */}
            <Section title="About you" subtitle="A short, honest bio outperforms a clever one.">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Bio</label>
                  <span className={`text-xs ${bio.length > 500 ? "text-destructive" : "text-muted-foreground"}`}>{bio.length}/500</span>
                </div>
                <textarea
                  rows={5}
                  maxLength={500}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="I'm a coffee-obsessed designer who lives for weekend hikes on Table Mountain…"
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Grid>
                <Field label="Occupation" placeholder="Product designer" />
                <Field label="Education" placeholder="University of Cape Town" />
              </Grid>
              <Grid>
                <Select label="Relationship goal" options={["Long-term relationship","Marriage","Casual dating","New friends","Still figuring it out"]} />
                <Select label="Have children" options={["Prefer not to say","No","Yes","Someday"]} />
              </Grid>
            </Section>

            {/* Interests */}
            <Section title="Interests" subtitle="Pick up to 12 — they help us find compatible matches.">
              <div className="flex flex-wrap gap-2">
                {interests.map((t) => (
                  <button type="button" key={t} onClick={() => toggleInterest(t)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-soft">
                    {t} <X className="h-3 w-3" />
                  </button>
                ))}
                {interests.length === 0 && <p className="text-sm text-muted-foreground">No interests yet — add some below.</p>}
              </div>

              <div className="flex gap-2">
                <input
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
                  placeholder="Add a custom interest…"
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="button" onClick={addInterest}
                  className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition">
                  Add
                </button>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedInterests.filter((s) => !interests.includes(s)).map((t) => (
                    <button type="button" key={t} onClick={() => toggleInterest(t)}
                      className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium hover:border-pink hover:text-pink transition">
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* Preferences */}
            <Section title="Match preferences" subtitle="Who would you like to meet?">
              <Grid>
                <Select label="Interested in" options={["Women","Men","Everyone"]} />
                <Field label="Age range" placeholder="25 – 35" />
              </Grid>
              <Grid>
                <Select label="Max distance" options={["10 km","25 km","50 km","100 km","Anywhere in SA"]} />
                <Select label="Show me" options={["Everyone","Verified profiles only","Premium members"]} />
              </Grid>
            </Section>

            {/* Privacy */}
            <Section title="Privacy" subtitle="You're always in control.">
              <Toggle label="Show my profile in search" defaultChecked />
              <Toggle label="Only verified members can message me" />
              <Toggle label="Hide my last active status" />
            </Section>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 rounded-3xl bg-card border border-border p-5 shadow-soft sticky bottom-4">
              <p className="text-xs text-muted-foreground">Changes are private until you save.</p>
              <div className="flex items-center gap-3">
                <Link to="/matches" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition">
                  Cancel
                </Link>
                <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
                  {saved ? (<><Check className="h-4 w-4" /> Saved</>) : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-soft space-y-5">
      <div>
        <h3 className="font-display text-2xl font-bold">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input {...rest} className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}
function Select({ label, options, defaultValue }: { label: string; options: string[]; defaultValue?: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select defaultValue={defaultValue} className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <button type="button" onClick={() => setOn(!on)}
      className="flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm font-medium hover:bg-muted transition">
      <span>{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-gradient-brand" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition ${on ? "left-[calc(100%-1.375rem)]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
