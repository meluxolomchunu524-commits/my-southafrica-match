import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Heart, ImagePlus, Loader2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { signUpFn } from "@/api/auth-fns";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — LoveConnect SA" },
      { name: "description", content: "Create your free LoveConnect SA profile and start meeting singles across South Africa." },
    ],
  }),
  component: Signup,
});

const provinces = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Free State","Limpopo","Mpumalanga","North West","Northern Cape"];
const MIN_PHOTOS = 3;
const MAX_PHOTOS = 6;
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB (base64 ~33% larger, keep DB rows manageable)
const ACCEPTED = ["image/jpeg","image/jpg","image/png","image/webp","image/heic","image/heif"];

type FormState = {
  full_name: string; username: string; email: string; phone: string;
  password: string; confirm: string; gender: string; date_of_birth: string;
  province: string; city: string; relationship_preference: string; interests: string; bio: string;
};

const initial: FormState = {
  full_name: "", username: "", email: "", phone: "", password: "", confirm: "",
  gender: "", date_of_birth: "", province: "", city: "", relationship_preference: "", interests: "", bio: "",
};

type PickedPhoto = { file: File; key: string; previewUrl: string };

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [f, setF] = useState<FormState>(initial);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  const photoError = useMemo(() => {
    if (photos.length === 0) return null;
    if (photos.length < MIN_PHOTOS) return `Please add at least ${MIN_PHOTOS} photos (${photos.length}/${MIN_PHOTOS}).`;
    return null;
  }, [photos]);

  function onPickPhotos(files: FileList | null) {
    if (!files) return;
    setError(null);
    const next: PickedPhoto[] = [...photos];
    const existingKeys = new Set(next.map((p) => p.key));
    for (const file of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) { setError(`You can add up to ${MAX_PHOTOS} photos.`); break; }
      const type = (file.type || "").toLowerCase();
      const nameLower = file.name.toLowerCase();
      const isHeic = nameLower.endsWith(".heic") || nameLower.endsWith(".heif");
      if (!ACCEPTED.includes(type) && !isHeic) { setError(`"${file.name}" is not a supported image. Use JPG, PNG, WebP, or HEIC.`); continue; }
      if (file.size > MAX_BYTES) { setError(`"${file.name}" exceeds 3 MB.`); continue; }
      const key = `${file.name}:${file.size}:${file.lastModified}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      next.push({ file, key, previewUrl: URL.createObjectURL(file) });
    }
    setPhotos(next);
    if (photoRef.current) photoRef.current.value = "";
  }

  function removePhoto(key: string) {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.key === key);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((p) => p.key !== key);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (photos.length < MIN_PHOTOS) { setError(`Please add at least ${MIN_PHOTOS} profile photos.`); return; }
    if (f.password !== f.confirm) { setError("Passwords do not match."); return; }
    if (f.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const photoBase64 = await Promise.all(photos.map((p) => fileToBase64(p.file)));
      const interestsArr = f.interests.split(",").map((s) => s.trim()).filter(Boolean);
      const result = await signUpFn({
        data: {
          email: f.email, password: f.password, full_name: f.full_name,
          username: f.username, phone: f.phone, gender: f.gender,
          date_of_birth: f.date_of_birth, province: f.province, city: f.city,
          relationship_preference: f.relationship_preference, bio: f.bio,
          photos: photoBase64, interests: interestsArr,
        },
      });
      localStorage.setItem("lc_token", result.token);
      setUser(result.user); // also writes lc_user cache via cacheUser inside setUser
      setSuccess(true);
      setTimeout(() => navigate({ to: "/profile" }), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-gradient-soft py-12 px-4 grid place-items-center">
        <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-8 sm:p-10 shadow-soft text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-9 w-9 text-primary" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold">Welcome to LoveConnect SA!</h1>
          <p className="mt-3 text-muted-foreground">Your account has been created successfully. Taking you to your profile…</p>
          <div className="mt-6"><Loader2 className="mx-auto h-5 w-5 animate-spin text-pink" /></div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-soft py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
            <Heart className="h-6 w-6 text-white" fill="white" />
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold">Create your account</h1>
          <p className="mt-2 text-muted-foreground">It's free — takes about 3 minutes.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 rounded-3xl bg-card border border-border p-8 shadow-soft space-y-6">
          {error && <p className="rounded-2xl bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</p>}

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Profile photos <span className="text-destructive">*</span></label>
              <span className="text-xs text-muted-foreground">{photos.length}/{MAX_PHOTOS} · min {MIN_PHOTOS}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Add at least {MIN_PHOTOS} clear photos of yourself. JPG, PNG, WebP or HEIC · up to 3 MB each.</p>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {photos.map((p, i) => (
                <div key={p.key} className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted">
                  <img src={p.previewUrl} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">Main</span>}
                  <button type="button" onClick={() => removePhoto(p.key)} aria-label={`Remove photo ${i + 1}`} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button type="button" onClick={() => photoRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-pink hover:text-pink transition" aria-label="Add photos">
                  <div className="flex flex-col items-center gap-1"><ImagePlus className="h-6 w-6" /><span className="text-[11px] font-medium">Add</span></div>
                </button>
              )}
              <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple className="hidden" onChange={(e) => onPickPhotos(e.target.files)} />
            </div>
            {photoError && <p className="mt-2 text-xs font-medium text-destructive">{photoError}</p>}
          </div>

          <Grid>
            <Field label="Full name" value={f.full_name} onChange={(v) => set("full_name", v)} placeholder="Thandi Nkosi" />
            <Field label="Username" value={f.username} onChange={(v) => set("username", v)} placeholder="thandi_n" />
          </Grid>
          <Grid>
            <Field label="Email address" type="email" autoComplete="email" value={f.email} onChange={(v) => set("email", v)} placeholder="you@example.com" />
            <Field label="Phone number" type="tel" value={f.phone} onChange={(v) => set("phone", v)} placeholder="+27 82 000 0000" required={false} />
          </Grid>
          <Grid>
            <Field label="Password" type="password" autoComplete="new-password" value={f.password} onChange={(v) => set("password", v)} placeholder="At least 8 characters" />
            <Field label="Confirm password" type="password" autoComplete="new-password" value={f.confirm} onChange={(v) => set("confirm", v)} placeholder="••••••••" />
          </Grid>
          <Grid>
            <Select label="Gender" value={f.gender} onChange={(v) => set("gender", v)} options={["Woman","Man","Non-binary","Prefer not to say"]} />
            <Field label="Date of birth" type="date" value={f.date_of_birth} onChange={(v) => set("date_of_birth", v)} />
          </Grid>
          <Grid>
            <Select label="Province" value={f.province} onChange={(v) => set("province", v)} options={provinces} />
            <Field label="City" value={f.city} onChange={(v) => set("city", v)} placeholder="Cape Town" />
          </Grid>
          <Select label="Relationship preference" value={f.relationship_preference} onChange={(v) => set("relationship_preference", v)} options={["Long-term relationship","Marriage","Casual dating","New friends","Still figuring it out"]} />
          <Field label="Interests (comma separated)" value={f.interests} onChange={(v) => set("interests", v)} placeholder="Hiking, jazz, cooking, travel" required={false} />
          <div>
            <label className="text-sm font-medium">Short biography</label>
            <textarea rows={4} value={f.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Tell people what makes you, you…" className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" required className="mt-1" />
            <span className="text-muted-foreground">I agree to the <a href="#" className="text-pink font-medium">Terms</a> and <a href="#" className="text-pink font-medium">Privacy Policy</a>, and I'm at least 18 years old.</span>
          </label>

          <button disabled={loading || photos.length < MIN_PHOTOS} className="w-full rounded-full bg-gradient-brand py-4 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create my profile
          </button>
          {photos.length < MIN_PHOTOS && (
            <p className="text-center text-xs text-muted-foreground -mt-2">
              Add {MIN_PHOTOS - photos.length} more photo{MIN_PHOTOS - photos.length === 1 ? "" : "s"} to enable sign up.
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-pink font-semibold hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
function Field({ label, value, onChange, required = true, ...rest }: { label: string; value: string; onChange: (v: string) => void; required?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input required={required} value={value} onChange={(e) => onChange(e.target.value)} {...rest} className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select required value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
        <option value="">Select…</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
