import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Loader2, MessageCircle } from "lucide-react";
import { PageHero } from "./about";
import { getMatchThreadsFn } from "@/api/db-fns";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/messages/")({
  component: MessagesList,
});

type Thread = {
  match_id: string; other_id: string; full_name: string | null;
  username: string | null; avatar_url: string | null; city: string | null;
  last_message: string | null; last_at: string | null; created_at: string;
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
    setLoading(true);
    getMatchThreadsFn({ data: {} })
      .then((rows) => { if (!cancelled) setThreads(rows as Thread[]); })
      .catch((e: any) => { if (!cancelled) setError(e.message ?? "Failed to load messages."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  return (
    <>
      <PageHero eyebrow="Messages" title="Your conversations" subtitle="Private chats with people who liked you back." />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {error && <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
        {(loading || authLoading) && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-pink" />
            <p className="mt-4 text-sm">Loading conversations…</p>
          </div>
        )}
        {!loading && threads.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-white"><Heart className="h-8 w-8" /></div>
            <h2 className="font-display text-2xl font-semibold">No matches yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Start liking profiles to spark your first conversation.</p>
            <Link to="/matches" className="mt-6 inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">Find matches</Link>
          </div>
        )}
        {!loading && threads.length > 0 && (
          <ul className="divide-y divide-border rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
            {threads.map((t) => (
              <li key={t.match_id}>
                <Link to="/messages/$matchId" params={{ matchId: t.match_id }} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition">
                  <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden bg-muted grid place-items-center">
                    {t.avatar_url ? <img src={t.avatar_url} alt={t.full_name ?? ""} className="h-full w-full object-cover" /> : <Heart className="h-6 w-6 text-pink" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">{t.full_name ?? t.username ?? "New match"}</p>
                      {t.last_at && <span className="text-xs text-muted-foreground shrink-0">{new Date(t.last_at).toLocaleDateString()}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{t.last_message ?? "Say hi to start the conversation 💬"}</p>
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
