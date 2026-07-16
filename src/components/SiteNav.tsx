import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/matches", label: "Find Matches" },
  { to: "/messages", label: "Messages" },
  { to: "/membership", label: "Membership" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand shadow-soft transition-transform group-hover:scale-110">
            <Heart className="h-4 w-4 text-white" fill="white" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            LoveConnect <span className="text-gradient-brand">SA</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-foreground/70 hover:text-foreground" }}
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                <User className="h-4 w-4" /> Profile
              </Link>
              <button onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition-shadow">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Login
              </Link>
              <Link to="/signup" className="rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition-shadow">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-center">
                    Profile
                  </Link>
                  <button onClick={handleSignOut} className="rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white text-center">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-center">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
