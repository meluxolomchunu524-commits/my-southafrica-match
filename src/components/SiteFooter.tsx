import { Link } from "@tanstack/react-router";
import { Heart, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand">
                <Heart className="h-4 w-4 text-white" fill="white" />
              </span>
              <span className="font-display text-xl font-bold text-white">
                LoveConnect SA
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              South Africa's home for genuine relationships. Safe, secure, and built
              for real connection — from Cape Town to Polokwane.
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 hover:bg-gradient-brand hover:border-transparent transition-all"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Company"
            links={[
              ["About", "/about"],
              ["Careers", "/about"],
              ["Contact", "/contact"],
            ]}
          />
          <FooterCol
            title="Support"
            links={[
              ["Help Centre", "/contact"],
              ["Safety Tips", "/about"],
              ["Community Guidelines", "/about"],
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              ["Privacy Policy", "/about"],
              ["Terms of Service", "/about"],
              ["Cookie Policy", "/about"],
            ]}
          />
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">
            © 2026 LoveConnect SA. All Rights Reserved.
          </p>
          <p className="text-xs text-white/50">
            Made with <Heart className="inline h-3 w-3 text-pink" fill="currentColor" /> in South Africa
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold text-white">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-white/60 hover:text-pink transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
