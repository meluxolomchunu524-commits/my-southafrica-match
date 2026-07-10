import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

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

function Signup() {
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

        <form onSubmit={(e) => e.preventDefault()} className="mt-10 rounded-3xl bg-card border border-border p-8 shadow-soft space-y-6">
          <Grid>
            <Field label="Full name" placeholder="Thandi Nkosi" />
            <Field label="Username" placeholder="thandi_n" />
          </Grid>
          <Grid>
            <Field label="Email address" type="email" placeholder="you@example.com" />
            <Field label="Phone number" type="tel" placeholder="+27 82 000 0000" />
          </Grid>
          <Grid>
            <Field label="Password" type="password" placeholder="••••••••" />
            <Field label="Confirm password" type="password" placeholder="••••••••" />
          </Grid>
          <Grid>
            <Select label="Gender" options={["Woman","Man","Non-binary","Prefer not to say"]} />
            <Field label="Date of birth" type="date" />
          </Grid>
          <Grid>
            <Select label="Province" options={provinces} />
            <Field label="City" placeholder="Cape Town" />
          </Grid>
          <Select label="Relationship preference" options={["Long-term relationship","Marriage","Casual dating","New friends","Still figuring it out"]} />
          <Field label="Interests" placeholder="e.g. Hiking, jazz, cooking, travel" />
          <div>
            <label className="text-sm font-medium">Short biography</label>
            <textarea rows={4} placeholder="Tell people what makes you, you…" className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-sm font-medium">Profile photo</label>
            <div className="mt-1 rounded-2xl border-2 border-dashed border-border bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
              <p>Drop a photo here, or <span className="text-pink font-semibold">browse</span></p>
              <p className="text-xs mt-1">JPG or PNG, up to 5MB</p>
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" required className="mt-1" />
            <span className="text-muted-foreground">
              I agree to the <a href="#" className="text-pink font-medium">Terms</a> and <a href="#" className="text-pink font-medium">Privacy Policy</a>, and I'm at least 18 years old.
            </span>
          </label>

          <button className="w-full rounded-full bg-gradient-brand py-4 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
            Create my profile
          </button>

          <p className="text-center text-xs text-muted-foreground">
            We'll email you a verification link before your profile goes live.
          </p>
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
function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input required {...rest} className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}
function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select required className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
        <option value="">Select…</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
