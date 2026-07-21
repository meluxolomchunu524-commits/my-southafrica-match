import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, MapPin, X, Loader2, Sparkles, MessageCircle, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageHero } from "./about";
import { getBrowsableProfilesFn, recordLikeFn } from "@/api/db-fns";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Find Matches — LoveConnect SA" },
      { name: "description", content: "Browse verified singles across South Africa." },
    ],
  }),
  component: Matches,
});

type Profile = {
  id: string; full_name: string | null; username: string | null;
  gender: string | null; date_of_birth: string | null;
  city: string | null; province: string | null;
  bio: string | null; avatar_url: string | null; cover_url: string | null;
};

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

/** Gradient colours for profiles with no photo — cycles by index */
const GRADIENTS = [
  "from-pink-400 to-purple-600",
  "from-rose-400 to-pink-600",
  "from-violet-500 to-purple-700",
  "from-fuchsia-400 to-pink-600",
  "from-purple-400 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-indigo-400 to-purple-600",
  "from-amber-400 to-pink-500",
];

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function Matches() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [matchToast, setMatchToast] = useState<{ name: string; matchId: string } | null>(null);
  const [loopBanner, setLoopBanner] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    // Wait until auth has finished validating before hitting an authenticated
    // server function. Firing on the optimistic localStorage cache alone races
    // ahead of token validation and surfaces a false "Not authenticated" error.
    if (authLoading || !user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getBrowsableProfilesFn({ data: {} })
      .then((list) => {
        if (!cancelled) {
          setProfiles(list as Profile[]);
          setIndex(0);
        }
      })
      .catch((e: any) => {
        if (cancelled) return;
        const msg = e?.message ?? "Failed to load profiles.";
        // A stale/absent session token means we're not really logged in —
        // send the user to log in instead of showing a dead-end error.
        if (/not authenticated/i.test(msg)) {
          navigate({ to: "/login" });
          return;
        }
        setError(msg);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, authLoading, navigate]);

  // Compute the visible profile — wrap around when we hit the end
  const current: Profile | undefined = profiles.length > 0 ? profiles[index % profiles.length] : undefined;
  const age = useMemo(() => (current ? ageFromDob(current.date_of_birth) : null), [current]);
  const gradient = GRADIENTS[(index % profiles.length) % GRADIENTS.length];
  const cardInitials = initials(current?.full_name ?? null);

  async function act(action: "like" | "pass") {
    if (!user || !current || acting) return;
    setActing(true);
    setError(null);
    try {
      if (action === "like") {
        const res = await recordLikeFn({ data: { likedId: current.id, action } });
        if (res.matched && res.matchId) {
          if (toastTimer.current) clearTimeout(toastTimer.current);
          setMatchToast({ name: current.full_name ?? "your new connection", matchId: res.matchId });
          toastTimer.current = setTimeout(() => setMatchToast(null), 6000);
        }
      }
      const nextIndex = index + 1;
      if (nextIndex > 0 && nextIndex % profiles.length === 0) {
        setLoopBanner(true);
        setTimeout(() => setLoopBanner(false), 3000);
      }
      setIndex(nextIndex);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setActing(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Find matches"
        title="Your next great love, just a swipe away."
        subtitle="Real singles from every corner of South Africa."
      />
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">

        {/* It's a match! toast */}
        {matchToast && (
          <div className="mb-6 rounded-3xl bg-gradient-brand p-5 text-white text-center shadow-glow animate-in fade-in slide-in-from-top-4">
            <p className="font-display text-lg font-semibold">
              <Sparkles className="inline h-5 w-5 mr-2" />
              It's a match with {matchToast.name}! 💕
            </p>
            <Link
              to="/messages/$matchId"
              params={{ matchId: matchToast.matchId }}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2 text-sm font-semibold text-purple hover:bg-white transition"
            >
              <MessageCircle className="h-4 w-4" /> Say hello
            </Link>
          </div>
        )}

        {/* Looped back to start banner */}
        {loopBanner && (
          <div className="mb-6 rounded-3xl border border-border bg-card p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2 shadow-soft">
            <RotateCcw className="h-4 w-4 text-pink" />
            Starting from the beginning again…
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {(loading || authLoading) && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-pink" />
            <p className="mt-4 text-sm">Loading profiles…</p>
          </div>
        )}

        {!loading && !authLoading && profiles.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-white">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-semibold">No profiles yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first — complete your profile so others can find you.
            </p>
            <Link
              to="/profile"
              className="mt-6 inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition"
            >
              Complete my profile
            </Link>
          </div>
        )}

        {!loading && !authLoading && current && (
          <>
            {/* Progress indicator */}
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{(index % profiles.length) + 1} of {profiles.length}</span>
              <span className="flex gap-0.5">
                {profiles.slice(0, Math.min(profiles.length, 20)).map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block h-1 rounded-full transition-all ${
                      i === index % profiles.length
                        ? "w-4 bg-pink"
                        : "w-1 bg-border"
                    }`}
                  />
                ))}
              </span>
            </div>

            <div className="overflow-hidden rounded-[2rem] shadow-soft bg-card border border-border">
              {/* Photo / gradient hero */}
              <div className="relative aspect-[4/5] w-full bg-muted">
                {current.avatar_url ? (
                  <img
                    src={current.avatar_url}
                    alt={current.full_name ?? "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className={`grid h-full w-full place-items-center bg-gradient-to-br ${gradient}`}>
                    <span className="font-display text-7xl font-bold text-white/90 select-none">
                      {cardInitials}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="font-display text-3xl font-semibold leading-tight">
                    {current.full_name ?? current.username ?? "Anonymous"}
                    {age !== null && <span className="font-normal">, {age}</span>}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-white/80">
                    {current.gender && (
                      <span className="capitalize">{current.gender}</span>
                    )}
                    {(current.city || current.province) && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {[current.city, current.province].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {current.bio && (
                <div className="px-6 pt-5 pb-2">
                  <p className="text-sm leading-relaxed text-foreground/80">{current.bio}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-8 p-6 pt-4">
                <button
                  onClick={() => act("pass")}
                  disabled={acting}
                  aria-label="Pass"
                  className="grid h-16 w-16 place-items-center rounded-full bg-white border border-border shadow-soft hover:scale-110 hover:border-muted-foreground/40 transition-all disabled:opacity-50"
                >
                  <X className="h-7 w-7 text-muted-foreground" />
                </button>
                <button
                  onClick={() => act("like")}
                  disabled={acting}
                  aria-label="Like"
                  className="grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow hover:scale-110 transition-all disabled:opacity-50"
                >
                  {acting
                    ? <Loader2 className="h-8 w-8 text-white animate-spin" />
                    : <Heart className="h-9 w-9 text-white" fill="white" />}
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
