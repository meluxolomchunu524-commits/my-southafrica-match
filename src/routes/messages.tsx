import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Lock } from "lucide-react";
import { PageHero } from "./about";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — LoveConnect SA" },
      { name: "description", content: "Chat privately and safely with your matches on LoveConnect SA." },
    ],
  }),
  component: Messages,
});

function Messages() {
  return (
    <>
      <PageHero eyebrow="Messages" title="Real conversations. Zero games." subtitle="Message your matches with text, emojis, and photos — private, encrypted, effortless." />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-brand shadow-glow">
          <Lock className="h-7 w-7 text-white" />
        </div>
        <h2 className="mt-8 font-display text-3xl md:text-4xl font-bold">Sign in to see your messages</h2>
        <p className="mt-4 text-muted-foreground">
          Your inbox is private and encrypted. Create a free account or log in to start chatting with your matches.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted transition">Log in</Link>
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
            <MessageCircle className="h-4 w-4" /> Create account
          </Link>
        </div>
      </section>
    </>
  );
}
