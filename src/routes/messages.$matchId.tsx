import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart, Loader2, Send, MapPin } from "lucide-react";
import { getChatFn, sendMessageFn } from "@/api/db-fns";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/messages/$matchId")({
  component: MatchChat,
});

type Message = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string };
type OtherProfile = { id: string; full_name: string | null; username: string | null; avatar_url: string | null; city: string | null; province: string | null; bio: string | null };

function MatchChat() {
  const { matchId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [other, setOther] = useState<OtherProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  function loadChat(silent = false) {
    if (!user) return;
    if (!silent) setLoading(true);
    getChatFn({ data: { matchId } })
      .then(({ other: o, messages: msgs }) => {
        setOther(o as OtherProfile);
        setMessages(msgs as Message[]);
        setError(null);
      })
      .catch((e: any) => setError(e.message ?? "Failed to load chat."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!user) return;
    loadChat();
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => loadChat(true), 5000);
    return () => clearInterval(interval);
  }, [user, matchId]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !other || !text.trim() || sending) return;
    setSending(true);
    setError(null);
    const content = text.trim();
    setText("");
    try {
      const msg = await sendMessageFn({ data: { matchId, receiverId: other.id, content } });
      setMessages((prev) => (prev.some((x) => x.id === msg.id) ? prev : [...prev, msg as Message]));
    } catch (e: any) {
      setError(e.message ?? "Failed to send. Please try again.");
      setText(content);
    } finally {
      setSending(false);
    }
  }

  if (loading || authLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 flex flex-col items-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-pink" />
        <p className="mt-4 text-sm">Opening your chat…</p>
      </section>
    );
  }

  if (error && !other) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-destructive">{error}</p>
        <Link to="/messages" className="mt-6 inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted transition">Back to messages</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden flex flex-col" style={{ height: "calc(100vh - 8rem)" }}>
        <header className="flex items-center gap-3 border-b border-border p-4 bg-gradient-to-r from-pink/5 to-purple/5">
          <Link to="/messages" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted transition"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="h-11 w-11 rounded-full overflow-hidden bg-muted grid place-items-center shrink-0">
            {other?.avatar_url ? <img src={other.avatar_url} alt={other.full_name ?? ""} className="h-full w-full object-cover" /> : <Heart className="h-5 w-5 text-pink" />}
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold truncate">{other?.full_name ?? other?.username ?? "Your match"}</p>
            {(other?.city || other?.province) && (
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{[other?.city, other?.province].filter(Boolean).join(", ")}</p>
            )}
          </div>
        </header>

        <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
          {messages.length === 0 && (
            <div className="mx-auto max-w-sm text-center py-10">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white shadow-glow"><Heart className="h-6 w-6" fill="white" /></div>
              <p className="font-display text-lg font-semibold">You matched with {other?.full_name?.split(" ")[0] ?? "them"}!</p>
              <p className="mt-1 text-sm text-muted-foreground">Break the ice — say hello 👋</p>
            </div>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === user!.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${mine ? "bg-gradient-brand text-white rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            );
          })}
        </div>

        {error && <div className="border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">{error}</div>}

        <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3 bg-card">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 rounded-full bg-muted px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink/40" maxLength={2000} />
          <button type="submit" disabled={sending || !text.trim()} aria-label="Send" className="grid h-12 w-12 place-items-center rounded-full bg-gradient-brand text-white shadow-soft hover:shadow-glow disabled:opacity-50 transition">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </section>
  );
}
