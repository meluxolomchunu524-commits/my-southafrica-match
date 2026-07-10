import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Mail, Lock } from "lucide-react";

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
        <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-md rounded-3xl bg-card border border-border p-8 shadow-soft space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold">Log in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your details to continue.</p>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-border bg-background px-4">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input type="email" required placeholder="you@example.com" className="flex-1 bg-transparent py-3 text-sm focus:outline-none" />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-border bg-background px-4">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input type="password" required placeholder="••••••••" className="flex-1 bg-transparent py-3 text-sm focus:outline-none" />
            </div>
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <a href="#" className="text-pink font-medium hover:underline">Forgot password?</a>
          </div>

          <button className="w-full rounded-full bg-gradient-brand py-3.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
            Log in
          </button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex-1 border-t border-border" /> or continue with <span className="flex-1 border-t border-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="rounded-full border border-border py-3 text-sm font-medium hover:bg-muted transition">Google</button>
            <button type="button" className="rounded-full border border-border py-3 text-sm font-medium hover:bg-muted transition">Facebook</button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="text-pink font-semibold hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
