import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Heart, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { verifyEmailTokenFn } from "@/api/verify-fns";
import { useAuth } from "@/hooks/use-auth";

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
  const { token } = Route.useSearch();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setErrorMsg("No verification token found in this link. Please use the link from your email.");
      setStatus("error");
      return;
    }

    verifyEmailTokenFn({ data: { token } })
      .then((result) => {
        localStorage.setItem("lc_token", result.token);
        setUser(result.user);
        setStatus("success");
        // Give the user a moment to read the success message, then go to matches
        setTimeout(() => navigate({ to: "/matches" }), 3000);
      })
      .catch((e: any) => {
        setErrorMsg(e.message ?? "Something went wrong. Please try again.");
        setStatus("error");
      });
  }, [token]);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-soft py-12 px-4 grid place-items-center">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-10 shadow-soft text-center">

        {status === "loading" && (
          <>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-pink" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold">Verifying your email…</h1>
            <p className="mt-2 text-sm text-muted-foreground">Just a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold">Email verified!</h1>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Your account is now active. Welcome to LoveConnect SA — taking you to your matches now.
            </p>
            <div className="mt-6">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-pink" />
            </div>
            <Link
              to="/matches"
              className="mt-5 inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition"
            >
              Browse matches now
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10">
              <XCircle className="h-9 w-9 text-destructive" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold">Verification failed</h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                to="/signup"
                className="rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition"
              >
                Sign up again
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted transition"
              >
                Log in
              </Link>
            </div>
          </>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5 text-pink" fill="currentColor" />
          LoveConnect SA
        </div>
      </div>
    </section>
  );
}
