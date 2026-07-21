import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Heart } from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : "",
  }),
  head: () => ({
    meta: [{ title: "Verify your email — LoveConnect SA" }],
  }),
  component: VerifyEmail,
});

function VerifyEmail() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-soft py-12 px-4 grid place-items-center">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-10 shadow-soft text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">You're all set</h1>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          Email verification is not required. You can log in with your credentials right away.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition"
        >
          Go to login
        </Link>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5 text-pink" fill="currentColor" />
          LoveConnect SA
        </div>
      </div>
    </section>
  );
}
