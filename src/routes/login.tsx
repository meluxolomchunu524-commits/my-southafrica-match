import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Heart, Mail, Lock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedNotice, setVerifiedNotice] = useState(false);

  // Post-verification landing: sign the user out (Supabase auto-signs them in
  // when they click the confirmation link) so they must log in explicitly.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "1") {
      setVerifiedNotice(true);
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) supabase.auth.signOut();
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    navigate({ to: "/matches" });
  }

  async function onGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message ?? "Google sign in failed");
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

          {verifiedNotice && (
            <p className="rounded-2xl bg-primary/10 text-primary text-sm px-4 py-3 inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Email verified successfully. Please log in.
            </p>
          )}
          {error && <p className="rounded-2xl bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</p>}

          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-border bg-background px-4">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 bg-transparent py-3 text-sm focus:outline-none" />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-border bg-background px-4">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="flex-1 bg-transparent py-3 text-sm focus:outline-none" />
            </div>
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <a href="#" className="text-pink font-medium hover:underline">Forgot password?</a>
          </div>

          <button disabled={loading} className="w-full rounded-full bg-gradient-brand py-3.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition disabled:opacity-70 inline-flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Log in
          </button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex-1 border-t border-border" /> or continue with <span className="flex-1 border-t border-border" />
          </div>

          <button type="button" onClick={onGoogle} className="w-full rounded-full border border-border py-3 text-sm font-medium hover:bg-muted transition">
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="text-pink font-semibold hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
