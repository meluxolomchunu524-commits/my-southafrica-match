import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

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

type FormState = {
  full_name: string; username: string; email: string; phone: string;
  password: string; confirm: string; gender: string; date_of_birth: string;
  province: string; city: string; relationship_preference: string; interests: string; bio: string;
};

const initial: FormState = {
  full_name: "", username: "", email: "", phone: "", password: "", confirm: "",
  gender: "", date_of_birth: "", province: "", city: "", relationship_preference: "", interests: "", bio: "",
};

function Signup() {
  const navigate = useNavigate();
  const [f, setF] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setNotice(null);
    if (f.password !== f.confirm) return setError("Passwords do not match.");
    if (f.password.length < 8) return setError("Password must be at least 8 characters.");

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: f.email,
      password: f.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: f.full_name,
          username: f.username,
          phone: f.phone,
          gender: f.gender,
          date_of_birth: f.date_of_birth,
          province: f.province,
          city: f.city,
          relationship_preference: f.relationship_preference,
          bio: f.bio,
        },
      },
    });
    setLoading(false);
    if (error) return setError(error.message);

    // If interests were provided, save them once profile row exists (trigger creates it).
    const interestsArr = f.interests.split(",").map((s) => s.trim()).filter(Boolean);
    if (interestsArr.length && data.user) {
      await supabase.from("profiles").update({ interests: interestsArr }).eq("id", data.user.id);
    }

    if (data.session) {
      navigate({ to: "/profile" });
    } else {
      setNotice("Check your email to verify your account, then log in.");
    }
  }

  async function onGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message ?? "Google sign in failed");
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
          {notice && <p className="rounded-2xl bg-primary/10 text-primary text-sm px-4 py-3">{notice}</p>}

          <button type="button" onClick={onGoogle} className="w-full rounded-full border border-border py-3 text-sm font-medium hover:bg-muted transition">
            Continue with Google
          </button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex-1 border-t border-border" /> or sign up with email <span className="flex-1 border-t border-border" />
          </div>

          <Grid>
            <Field label="Full name" value={f.full_name} onChange={(v) => set("full_name", v)} placeholder="Thandi Nkosi" />
            <Field label="Username" value={f.username} onChange={(v) => set("username", v)} placeholder="thandi_n" />
          </Grid>
          <Grid>
            <Field label="Email address" type="email" value={f.email} onChange={(v) => set("email", v)} placeholder="you@example.com" />
            <Field label="Phone number" type="tel" value={f.phone} onChange={(v) => set("phone", v)} placeholder="+27 82 000 0000" required={false} />
          </Grid>
          <Grid>
            <Field label="Password" type="password" value={f.password} onChange={(v) => set("password", v)} placeholder="At least 8 characters" />
            <Field label="Confirm password" type="password" value={f.confirm} onChange={(v) => set("confirm", v)} placeholder="••••••••" />
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
            <span className="text-muted-foreground">
              I agree to the <a href="#" className="text-pink font-medium">Terms</a> and <a href="#" className="text-pink font-medium">Privacy Policy</a>, and I'm at least 18 years old.
            </span>
          </label>

          <button disabled={loading} className="w-full rounded-full bg-gradient-brand py-4 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition disabled:opacity-70 inline-flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create my profile
          </button>

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
