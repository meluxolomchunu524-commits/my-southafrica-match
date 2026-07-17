import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, Check, Heart, ImagePlus, Loader2, MapPin, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getProfileFn, getPhotosFn, updateProfileFn } from "@/api/db-fns";
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

const provinces = [
  "Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape",
  "Free State","Limpopo","Mpumalanga","North West","Northern Cape",
];
const suggestedInterests = [
  "Hiking","Braai","Wine tasting","Jazz","Afrobeats","Travel","Yoga",
  "Reading","Cooking","Photography","Rugby","Movies","Art","Coffee","Volunteering","Gaming",
];

const MAX_PHOTOS = 6;
const MAX_BYTES = 3 * 1024 * 1024;
const ACCEPTED = ["image/jpeg","image/jpg","image/png","image/webp","image/heic","image/heif"];

type Photo = { key: string; url: string; isNew: boolean; file?: File };

type ProfileForm = {
  full_name: string; username: string; date_of_birth: string; gender: string;
  province: string; city: string; bio: string; occupation: string; education: string;
  relationship_preference: string; interests: string[];
  cover_url: string | null;
};

const empty: ProfileForm = {
  full_name: "", username: "", date_of_birth: "", gender: "", province: "", city: "",
  bio: "", occupation: "", education: "", relationship_preference: "", interests: [],
  cover_url: null,
};

/** Convert any date value from the DB (ISO string, Date object, or "YYYY-MM-DD") to "YYYY-MM-DD" */
function toDateInput(raw: unknown): string {
  if (!raw) return "";
  const d = new Date(raw as string);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [f, setF] = useState<ProfileForm>(empty);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    // Fire metadata and photos in parallel — photos can be large (base64)
    // so we don't block the form render on them.
    Promise.all([
      getProfileFn({ data: {} }),
      getPhotosFn({ data: {} }),
    ]).then(([data, photoUrls]) => {
      if (data) {
        setF({
          full_name: data.full_name ?? "",
          username: data.username ?? "",
          date_of_birth: toDateInput(data.date_of_birth),
          gender: data.gender ?? "",
          province: data.province ?? "",
          city: data.city ?? "",
          bio: data.bio ?? "",
          occupation: data.occupation ?? "",
          education: data.education ?? "",
          relationship_preference: data.relationship_preference ?? "",
          interests: Array.isArray(data.interests) ? data.interests : [],
          cover_url: data.cover_url ?? null,
        });
      }
      const stored: string[] = Array.isArray(photoUrls) && photoUrls.length > 0
        ? photoUrls
        : (data?.avatar_url ? [data.avatar_url] : []);
      setPhotos(stored.map((url, i) => ({ key: `existing-${i}`, url, isNew: false })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, authLoading, navigate]);

  function onPickPhotos(files: FileList | null) {
    if (!files) return;
    setPhotoError(null);
    setPhotos((prev) => {
      const existingKeys = new Set(prev.map((p) => p.key));
      const next = [...prev];
      for (const file of Array.from(files)) {
        if (next.length >= MAX_PHOTOS) { setPhotoError(`Maximum ${MAX_PHOTOS} photos allowed.`); break; }
        const type = (file.type || "").toLowerCase();
        const isHeic = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
        if (!ACCEPTED.includes(type) && !isHeic) { setPhotoError(`"${file.name}" must be JPG, PNG, WebP or HEIC.`); continue; }
        if (file.size > MAX_BYTES) { setPhotoError(`"${file.name}" exceeds 3 MB.`); continue; }
        const key = `new-${file.name}-${file.size}-${file.lastModified}`;
        if (existingKeys.has(key)) continue;
        existingKeys.add(key);
        next.push({ key, url: URL.createObjectURL(file), isNew: true, file });
      }
      return next;
    });
    if (photoRef.current) photoRef.current.value = "";
  }

  function removePhoto(key: string) {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.key === key);
      if (removed?.isNew) URL.revokeObjectURL(removed.url);
      return prev.filter((p) => p.key !== key);
    });
  }

  function readCoverFile(file: File) {
    const r = new FileReader();
    r.onload = () => set("cover_url", r.result as string);
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
      // Convert any new (blob-URL) photos to base64; keep existing data-URL photos as-is
      const resolvedPhotos = await Promise.all(
        photos.map(async (p) => {
          if (p.isNew && p.file) return fileToBase64(p.file);
          return p.url; // already a base64 data-URL from the DB
        }),
      );
      await updateProfileFn({
        data: {
          full_name: f.full_name || null,
          username: f.username || null,
          date_of_birth: f.date_of_birth || null,
          gender: f.gender || null,
          province: f.province || null,
          city: f.city || null,
          bio: f.bio || null,
          occupation: f.occupation || null,
          education: f.education || null,
          relationship_preference: f.relationship_preference || null,
          interests: f.interests,
          photos: resolvedPhotos,
          cover_url: f.cover_url,
        },
      });
      // After saving, replace blob URLs with resolved base64 so they survive re-renders
      setPhotos((prev) =>
        prev.map((p, i) =>
          p.isNew ? { ...p, url: resolvedPhotos[i], isNew: false, file: undefined } : p,
        ),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  const mainPhoto = photos[0]?.url ?? null;

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-pink" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-soft min-h-screen">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-pink">Your profile</p>
            <h1 className="mt-1 font-display text-4xl sm:text-5xl font-bold">
              Make a great first impression
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Genuine photos and an honest bio get the best matches.
            </p>
          </div>
          <Link
            to="/matches"
            className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-muted transition"
          >
            View matches
          </Link>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-8">
          {error && (
            <p className="rounded-2xl bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</p>
          )}

          {/* Cover / avatar hero card */}
          <div className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden">
            <div
              className="relative h-48 sm:h-64 bg-gradient-brand"
              style={
                f.cover_url
                  ? { backgroundImage: `url(${f.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            >
              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur px-4 py-2 text-xs font-semibold text-white hover:bg-black/70 transition"
              >
                <ImagePlus className="h-4 w-4" />
                {f.cover_url ? "Change cover" : "Add cover photo"}
              </button>
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && readCoverFile(e.target.files[0])}
              />
            </div>
            <div className="px-6 sm:px-8 pb-6 -mt-16 flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative">
                <div
                  className="h-32 w-32 rounded-full bg-muted ring-4 ring-background overflow-hidden grid place-items-center shadow-glow"
                  style={
                    mainPhoto
                      ? { backgroundImage: `url(${mainPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : undefined
                  }
                >
                  {!mainPhoto && <Heart className="h-8 w-8 text-pink" fill="currentColor" />}
                </div>
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  aria-label="Add profile photos"
                  className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-white shadow-soft hover:shadow-glow transition"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 sm:pb-2">
                <h2 className="font-display text-2xl font-bold">{f.full_name || "Your name"}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {f.city || "City"}{f.province ? `, ${f.province}` : ""}
                </p>
              </div>
              <div className="sm:pb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-purple">
                  <Sparkles className="h-3 w-3" /> {user?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Photo gallery manager */}
          <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-soft space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-bold">Profile photos</h3>
                <span className="text-xs text-muted-foreground">{photos.length}/{MAX_PHOTOS}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your first photo is your main profile picture. JPG, PNG, WebP or HEIC · up to 3 MB each.
              </p>
            </div>
            {photoError && (
              <p className="text-sm font-medium text-destructive">{photoError}</p>
            )}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {photos.map((p, i) => (
                <div
                  key={p.key}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted"
                >
                  <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(p.key)}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-pink hover:text-pink transition"
                  aria-label="Add more photos"
                >
                  <div className="flex flex-col items-center gap-1">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-[11px] font-medium">Add</span>
                  </div>
                </button>
              )}
              <input
                ref={photoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                multiple
                className="hidden"
                onChange={(e) => onPickPhotos(e.target.files)}
              />
            </div>
          </div>

          {/* Basic information */}
          <Section title="Basic information">
            <Grid>
              <Field label="Display name" value={f.full_name} onChange={(v) => set("full_name", v)} />
              <Field label="Username" value={f.username} onChange={(v) => set("username", v)} />
            </Grid>
            <Grid>
              <Field label="Date of birth" type="date" value={f.date_of_birth} onChange={(v) => set("date_of_birth", v)} />
              <Select label="Gender" value={f.gender} onChange={(v) => set("gender", v)} options={["Woman","Man","Non-binary","Prefer not to say"]} />
            </Grid>
            <Grid>
              <Select label="Province" value={f.province} onChange={(v) => set("province", v)} options={provinces} />
              <Field label="City" value={f.city} onChange={(v) => set("city", v)} />
            </Grid>
          </Section>

          {/* About you */}
          <Section title="About you">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Bio</label>
                <span className="text-xs text-muted-foreground">{f.bio.length}/500</span>
              </div>
              <textarea
                rows={5}
                maxLength={500}
                value={f.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="Tell people what makes you, you…"
                className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Grid>
              <Field label="Occupation" value={f.occupation} onChange={(v) => set("occupation", v)} />
              <Field label="Education" value={f.education} onChange={(v) => set("education", v)} />
            </Grid>
            <Select
              label="Relationship goal"
              value={f.relationship_preference}
              onChange={(v) => set("relationship_preference", v)}
              options={["Long-term relationship","Marriage","Casual dating","New friends","Still figuring it out"]}
            />
          </Section>

          {/* Interests */}
          <Section title="Interests" subtitle="Pick up to 12.">
            <div className="flex flex-wrap gap-2">
              {f.interests.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleInterest(t)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-soft"
                >
                  {t} <X className="h-3 w-3" />
                </button>
              ))}
              {f.interests.length === 0 && (
                <p className="text-sm text-muted-foreground">No interests yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
                placeholder="Add a custom interest…"
                className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addInterest}
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition"
              >
                Add
              </button>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {suggestedInterests.filter((s) => !f.interests.includes(s)).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => toggleInterest(t)}
                    className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium hover:border-pink hover:text-pink transition"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Sticky save bar */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 rounded-3xl bg-card border border-border p-5 shadow-soft sticky bottom-4">
            <p className="text-xs text-muted-foreground">Changes are private until you save.</p>
            <div className="flex items-center gap-3">
              <Link
                to="/matches"
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <><Check className="h-4 w-4" /> Saved</>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
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
function Field({ label, value, onChange, ...rest }: {
  label: string; value: string; onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
        className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
