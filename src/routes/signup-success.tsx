import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/signup-success")({
  head: () => ({
    meta: [
      { title: "Account created — LoveConnect SA" },
      { name: "description", content: "Your account has been created successfully." },
    ],
  }),
  component: SignupSuccess,
});

function SignupSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate({ to: "/login", search: { registered: "1" } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-soft py-12 px-4 grid place-items-center">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-10 shadow-soft text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">Account created!</h1>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          Welcome to LoveConnect SA! Your profile has been created successfully. You're all set to start browsing and matching with singles across South Africa.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/login"
            search={{ registered: "1" }}
            className="rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition"
          >
            Continue to login
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-pink" />
          <span>Redirecting in {countdown} seconds…</span>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5 text-pink" fill="currentColor" />
          LoveConnect SA
        </div>
      </div>
    </section>
  );
}
