import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Loader2, MessageCircle } from "lucide-react";
import { PageHero } from "./about";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/messages/")({
  component: MessagesList,
});

type Thread = {
  matchId: string;
  otherId: string;
  name: string;
  avatar: string | null;
  city: string | null;
  lastMessage: string | null;
  lastAt: string | null;
  createdAt: string;
};

function MessagesList() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const { data: matches, error: mErr } = await supabase
          .from("matches")
          .select("id, user_a, user_b, created_at")
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .order("created_at", { ascending: false });
        if (mErr) throw mErr;
        const rows = matches ?? [];
        const otherIds = rows.map((m: any) => (m.user_a === user.id ? m.user_b : m.user_a));

        const [profilesRes, msgsRes] = await Promise.all([
          otherIds.length
            ? supabase.from("profiles").select("id, full_name, username, avatar_url, city").in("id", otherIds)
            : Promise.resolve({ data: [], error: null } as any),
          rows.length
            ? supabase
                .from("messages")
                .select("match_id, content, created_at")
                .in("match_id", rows.map((m: any) => m.id))
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: [], error: null } as any),
        ]);
        if (profilesRes.error) throw profilesRes.error;
        if (msgsRes.error) throw msgsRes.error;

        const profileMap = new Map<string, any>((profilesRes.data ?? []).map((p: any) => [p.id, p]));
        const lastByMatch = new Map<string, any>();
        for (const m of msgsRes.data ?? []) {
          if (!lastByMatch.has(m.match_id)) lastByMatch.set(m.match_id, m);
        }

        const list: Thread[] = rows.map((m: any) => {
          const otherId = m.user_a === user.id ? m.user_b : m.user_a;
          const p = profileMap.get(otherId);
          const last = lastByMatch.get(m.id);
          return {
            matchId: m.id,
            otherId,
            name: p?.full_name ?? p?.username ?? "New match",
            avatar: p?.avatar_url ?? null,
            city: p?.city ?? null,
            lastMessage: last?.content ?? null,
            lastAt: last?.created_at ?? null,
            createdAt: m.created_at,
          };
        });
        if (!cancelled) setThreads(list);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load messages.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <>
      <PageHero eyebrow="Messages" title="Your conversations" subtitle="Private chats with people who liked you back." />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
        )}

        {(loading || authLoading) && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-pink" />
            <p className="mt-4 text-sm">Loading conversations…</p>
          </div>
        )}

        {!loading && threads.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-white">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-semibold">No matches yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Start liking profiles to spark your first conversation.</p>
            <Link to="/matches" className="mt-6 inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
              Find matches
            </Link>
          </div>
        )}

        {!loading && threads.length > 0 && (
          <ul className="divide-y divide-border rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
            {threads.map((t) => (
              <li key={t.matchId}>
                <Link
                  to="/messages/$matchId"
                  params={{ matchId: t.matchId }}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition"
                >
                  <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden bg-muted grid place-items-center">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" />
                    ) : (
                      <Heart className="h-6 w-6 text-pink" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">{t.name}</p>
                      {t.lastAt && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(t.lastAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {t.lastMessage ?? "Say hi to start the conversation 💬"}
                    </p>
                  </div>
                  <MessageCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
