import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, MapPin, X, Loader2, Sparkles, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHero } from "./about";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Find Matches — LoveConnect SA" },
      { name: "description", content: "Browse verified singles across South Africa. Like or pass and get matched instantly." },
    ],
  }),
  component: Matches,
});

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  gender: string | null;
  date_of_birth: string | null;
  city: string | null;
  province: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
};

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
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

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: seen, error: seenErr } = await supabase
          .from("profile_likes")
          .select("liked_id")
          .eq("liker_id", user.id);
        if (seenErr) throw seenErr;
        const excluded = new Set<string>([user.id, ...(seen ?? []).map((r: any) => r.liked_id)]);

        const { data, error: pErr } = await supabase
          .from("profiles")
          .select("id, full_name, username, gender, date_of_birth, city, province, bio, avatar_url, cover_url")
          .order("created_at", { ascending: false })
          .limit(100);
        if (pErr) throw pErr;
        const list = (data ?? []).filter((p) => !excluded.has(p.id));
        if (!cancelled) {
          setProfiles(list);
          setIndex(0);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load profiles.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const current = profiles[index];
  const age = useMemo(() => (current ? ageFromDob(current.date_of_birth) : null), [current]);

  async function act(action: "like" | "pass") {
    if (!user || !current || acting) return;
    setActing(true);
    setError(null);
    try {
      const { error: insErr } = await supabase
        .from("profile_likes")
        .insert({ liker_id: user.id, liked_id: current.id, action });
      if (insErr) throw insErr;

      if (action === "like") {
        const a = user.id < current.id ? user.id : current.id;
        const b = user.id < current.id ? current.id : user.id;
        const { data: match } = await supabase
          .from("matches")
          .select("id")
          .eq("user_a", a)
          .eq("user_b", b)
          .maybeSingle();
        if (match) {
          setMatchToast(`It's a match with ${current.full_name ?? "your new connection"}! 💕`);
          setTimeout(() => setMatchToast(null), 3500);
        }
      }
      setIndex((i) => i + 1);
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
        subtitle="Real, verified singles from every corner of South Africa."
      />

      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        {matchToast && (
          <div className="mb-6 rounded-3xl bg-gradient-brand p-5 text-white text-center shadow-glow animate-in fade-in slide-in-from-top-4">
            <Sparkles className="inline h-5 w-5 mr-2" />
            {matchToast}
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

        {!loading && !authLoading && !current && (
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-white">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-semibold">No more profiles available</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You've seen everyone for now. Check back soon — new singles join every day.
            </p>
            <Link
              to="/profile"
              className="mt-6 inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition"
            >
              Polish your profile
            </Link>
          </div>
        )}

        {!loading && current && (
          <div className="group relative overflow-hidden rounded-[2rem] shadow-soft bg-card border border-border">
            <div className="relative aspect-[4/5] w-full bg-muted">
              {current.avatar_url ? (
                <img
                  src={current.avatar_url}
                  alt={current.full_name ?? "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-pink/30 to-purple/30">
                  <Heart className="h-16 w-16 text-white/80" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="font-display text-3xl font-semibold">
                  {current.full_name ?? current.username ?? "Anonymous"}
                  {age !== null && <span className="font-normal">, {age}</span>}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/85">
                  {current.gender && <span className="capitalize">{current.gender}</span>}
                  {(current.city || current.province) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {[current.city, current.province].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {current.bio && (
              <div className="p-6">
                <p className="text-sm leading-relaxed text-foreground/80">{current.bio}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-6 p-6 pt-2">
              <button
                onClick={() => act("pass")}
                disabled={acting}
                aria-label="Pass"
                className="grid h-16 w-16 place-items-center rounded-full bg-white border border-border shadow-soft hover:scale-110 transition disabled:opacity-50"
              >
                <X className="h-7 w-7 text-muted-foreground" />
              </button>
              <button
                onClick={() => act("like")}
                disabled={acting}
                aria-label="Like"
                className="grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow hover:scale-110 transition disabled:opacity-50"
              >
                {acting ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Heart className="h-9 w-9 text-white" fill="white" />
                )}
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
