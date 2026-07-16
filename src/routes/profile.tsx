import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, Check, Heart, ImagePlus, Loader2, MapPin, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getProfileFn, updateProfileFn } from "@/api/db-fns";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Edit your profile — LoveConnect SA" },
      { name: "description", content: "Set up and manage your LoveConnect SA profile." },
    ],
  }),
  component: ProfilePage,
});

const provinces = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Free State","Limpopo","Mpumalanga","North West","Northern Cape"];
const suggestedInterests = ["Hiking","Braai","Wine tasting","Jazz","Afrobeats","Travel","Yoga","Reading","Cooking","Photography","Rugby","Movies","Art","Coffee","Volunteering","Gaming"];

type ProfileForm = {
  full_name: string; username: string; date_of_birth: string; gender: string;
  province: string; city: string; bio: string; occupation: string; education: string;
  relationship_preference: string; interests: string[];
  avatar_url: string | null; cover_url: string | null;
};

const empty: ProfileForm = {
  full_name: "", username: "", date_of_birth: "", gender: "", province: "", city: "",
  bio: "", occupation: "", education: "", relationship_preference: "", interests: [],
  avatar_url: null, cover_url: null,
};

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [f, setF] = useState<ProfileForm>(empty);
  const [interestInput, setInterestInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    getProfileFn({ data: {} }).then((data) => {
      if (data) {
        setF({
          full_name: data.full_name ?? "", username: data.username ?? "",
          date_of_birth: data.date_of_birth ?? "", gender: data.gender ?? "",
          province: data.province ?? "", city: data.city ?? "",
          bio: data.bio ?? "", occupation: data.occupation ?? "",
          education: data.education ?? "", relationship_preference: data.relationship_preference ?? "",
          interests: data.interests ?? [], avatar_url: data.avatar_url, cover_url: data.cover_url,
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, authLoading, navigate]);

  function readFile(file: File, key: "avatar_url" | "cover_url") {
    const r = new FileReader();
    r.onload = () => set(key, r.result as string);
    r.readAsDataURL(file);
  }

  function toggleInterest(t: string) {
    set("interests", f.interests.includes(t) ? f.interests.filter((x) => x !== t) : [...f.interests, t]);
  }
  function addInterest() {
    const v = interestInput.trim();
    if (v && !f.interests.includes(v) && f.interests.length < 12) {
      set("interests", [...f.interests, v]);
      setInterestInput("");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null); setSaving(true);
    try {
      await updateProfileFn({
        data: {
          full_name: f.full_name, username: f.username || null,
          date_of_birth: f.date_of_birth || null, gender: f.gender || null,
          province: f.province || null, city: f.city || null, bio: f.bio || null,
          occupation: f.occupation || null, education: f.education || null,
          relationship_preference: f.relationship_preference || null,
          interests: f.interests, avatar_url: f.avatar_url, cover_url: f.cover_url,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-pink" /></div>;
  }

  return (
    <div className="bg-gradient-soft min-h-screen">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-pink">Your profile</p>
            <h1 className="mt-1 font-display text-4xl sm:text-5xl font-bold">Make a great first impression</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">Genuine photos and an honest bio get the best matches.</p>
          </div>
          <Link to="/matches" className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-muted transition">View matches</Link>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-8">
          {error && <p className="rounded-2xl bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</p>}

          <div className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden">
            <div className="relative h-48 sm:h-64 bg-gradient-brand"
              style={f.cover_url ? { backgroundImage: `url(${f.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
              <button type="button" onClick={() => coverRef.current?.click()}
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur px-4 py-2 text-xs font-semibold text-white hover:bg-black/70 transition">
                <ImagePlus className="h-4 w-4" /> {f.cover_url ? "Change cover" : "Add cover photo"}
              </button>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], "cover_url")} />
            </div>
            <div className="px-6 sm:px-8 pb-6 -mt-16 flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-muted ring-4 ring-background overflow-hidden grid place-items-center shadow-glow"
                  style={f.avatar_url ? { backgroundImage: `url(${f.avatar_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                  {!f.avatar_url && <Heart className="h-8 w-8 text-pink" fill="currentColor" />}
                </div>
                <button type="button" onClick={() => avatarRef.current?.click()} aria-label="Upload profile photo"
                  className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-white shadow-soft hover:shadow-glow transition">
                  <Camera className="h-4 w-4" />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], "avatar_url")} />
              </div>
              <div className="flex-1 sm:pb-2">
                <h2 className="font-display text-2xl font-bold">{f.full_name || "Your name"}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {f.city || "City"}{f.province ? `, ${f.province}` : ""}</p>
              </div>
              <div className="sm:pb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-purple">
                  <Sparkles className="h-3 w-3" /> {user?.email}
                </span>
              </div>
            </div>
          </div>

          <Section title="Basic information">
            <Grid><Field label="Display name" value={f.full_name} onChange={(v) => set("full_name", v)} /><Field label="Username" value={f.username} onChange={(v) => set("username", v)} /></Grid>
            <Grid><Field label="Date of birth" type="date" value={f.date_of_birth} onChange={(v) => set("date_of_birth", v)} /><Select label="Gender" value={f.gender} onChange={(v) => set("gender", v)} options={["Woman","Man","Non-binary","Prefer not to say"]} /></Grid>
            <Grid><Select label="Province" value={f.province} onChange={(v) => set("province", v)} options={provinces} /><Field label="City" value={f.city} onChange={(v) => set("city", v)} /></Grid>
          </Section>

          <Section title="About you">
            <div>
              <div className="flex items-center justify-between"><label className="text-sm font-medium">Bio</label><span className="text-xs text-muted-foreground">{f.bio.length}/500</span></div>
              <textarea rows={5} maxLength={500} value={f.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Tell people what makes you, you…" className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <Grid><Field label="Occupation" value={f.occupation} onChange={(v) => set("occupation", v)} /><Field label="Education" value={f.education} onChange={(v) => set("education", v)} /></Grid>
            <Select label="Relationship goal" value={f.relationship_preference} onChange={(v) => set("relationship_preference", v)} options={["Long-term relationship","Marriage","Casual dating","New friends","Still figuring it out"]} />
          </Section>

          <Section title="Interests" subtitle="Pick up to 12.">
            <div className="flex flex-wrap gap-2">
              {f.interests.map((t) => (
                <button type="button" key={t} onClick={() => toggleInterest(t)} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-soft">
                  {t} <X className="h-3 w-3" />
                </button>
              ))}
              {f.interests.length === 0 && <p className="text-sm text-muted-foreground">No interests yet.</p>}
            </div>
            <div className="flex gap-2">
              <input value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }} placeholder="Add a custom interest…" className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <button type="button" onClick={addInterest} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition">Add</button>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {suggestedInterests.filter((s) => !f.interests.includes(s)).map((t) => (
                  <button type="button" key={t} onClick={() => toggleInterest(t)} className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium hover:border-pink hover:text-pink transition">+ {t}</button>
                ))}
              </div>
            </div>
          </Section>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 rounded-3xl bg-card border border-border p-5 shadow-soft sticky bottom-4">
            <p className="text-xs text-muted-foreground">Changes are private until you save.</p>
            <div className="flex items-center gap-3">
              <Link to="/matches" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition">Cancel</Link>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition disabled:opacity-70">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <><Check className="h-4 w-4" /> Saved</> : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-soft space-y-5"><div><h3 className="font-display text-2xl font-bold">{title}</h3>{subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}</div>{children}</div>;
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return <div><label className="text-sm font-medium">{label}</label><input value={value} onChange={(e) => onChange(e.target.value)} {...rest} className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>;
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div><label className="text-sm font-medium">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Select…</option>{options.map((o) => <option key={o}>{o}</option>)}</select></div>;
}
