import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Heart, Lock, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signInFn } from "@/api/auth-fns";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    registered: s.registered === "1",
  }),
  head: () => ({
    meta: [
      { title: "Log in — LoveConnect SA" },
      { name: "description", content: "Log in to your LoveConnect SA account." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { registered } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signInFn({ data: { email, password } });
      // Persist token + cached user for client middleware and instant auth.
      if (typeof window !== 'undefined') {
        localStorage.setItem('lc_token', res.token);
        localStorage.setItem('lc_user', JSON.stringify(res.user));
      }
      navigate({ to: "/matches" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-soft grid lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center p-12 bg-gradient-brand text-white relative overflow-hidden">
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-md">
          <Heart className="h-14 w-14 animate-float" fill="white" />
          <h2 className="mt-6 font-display text-4xl font-bold leading-tight">
            Welcome back to LoveConnect SA
          </h2>
          <p className="mt-4 text-white/85 leading-relaxed">
            Your matches are waiting. Sign in to pick up right where you left off.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl bg-card border border-border p-8 shadow-soft space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold">Log in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your details to continue.</p>
          </div>

          {registered && (
            <div className="flex items-start gap-3 rounded-2xl bg-green-50 border border-green-200 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-800 font-medium">
                Account created! Log in below to get started.
              </p>
            </div>
          )}

          {error && <p className="rounded-2xl bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</p>}

          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-border bg-background px-4">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 bg-transparent py-3 text-sm focus:outline-none" />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-border bg-background px-4">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="flex-1 bg-transparent py-3 text-sm focus:outline-none" />
            </div>
          </label>

          <button disabled={loading} className="w-full rounded-full bg-gradient-brand py-3.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition disabled:opacity-70 inline-flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Log in
          </button>

          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="text-pink font-semibold hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
