import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Shield,
  Users,
  UserCheck,
  UserX,
  Flag,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Ban,
  Filter,
  MoreVertical,
} from "lucide-react";
import member1 from "../assets/member-1.jpg";
import member2 from "../assets/member-2.jpg";
import member3 from "../assets/member-3.jpg";
import member4 from "../assets/member-4.jpg";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — LoveConnect SA" },
      { name: "description", content: "Moderate profiles, verify members, remove fake accounts and handle reports on LoveConnect SA." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type TabKey = "overview" | "verification" | "users" | "reports" | "fake";

const AVATARS = [member1, member2, member3, member4];

type PendingProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  submitted: string;
  photo: string;
  idDoc: string;
  status: "pending" | "approved" | "rejected";
};

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  joined: string;
  plan: "Free" | "Premium" | "VIP";
  verified: boolean;
  status: "active" | "suspended" | "banned";
  reports: number;
  photo: string;
};

type Report = {
  id: string;
  reporter: string;
  target: string;
  reason: string;
  details: string;
  date: string;
  severity: "low" | "medium" | "high";
  status: "open" | "reviewing" | "resolved";
};

type FakeCandidate = {
  id: string;
  name: string;
  reason: string;
  confidence: number;
  photo: string;
};

const initialPending: PendingProfile[] = [
  { id: "p1", name: "Thandiwe Nkosi", age: 27, city: "Johannesburg", submitted: "2h ago", photo: AVATARS[0], idDoc: "SA ID • Selfie", status: "pending" },
  { id: "p2", name: "Sipho Dlamini", age: 31, city: "Cape Town", submitted: "5h ago", photo: AVATARS[1], idDoc: "Passport • Selfie", status: "pending" },
  { id: "p3", name: "Naledi Mokoena", age: 24, city: "Pretoria", submitted: "1d ago", photo: AVATARS[2], idDoc: "SA ID • Selfie", status: "pending" },
  { id: "p4", name: "Reece van der Merwe", age: 29, city: "Durban", submitted: "1d ago", photo: AVATARS[3], idDoc: "Driver's License • Selfie", status: "pending" },
];

const initialUsers: ManagedUser[] = [
  { id: "u1", name: "Amahle Zulu", email: "amahle@example.com", joined: "Mar 2026", plan: "Premium", verified: true, status: "active", reports: 0, photo: AVATARS[0] },
  { id: "u2", name: "Jason Pretorius", email: "jason.p@example.com", joined: "Jan 2026", plan: "VIP", verified: true, status: "active", reports: 1, photo: AVATARS[1] },
  { id: "u3", name: "Lerato Khumalo", email: "lerato.k@example.com", joined: "Jun 2026", plan: "Free", verified: false, status: "active", reports: 3, photo: AVATARS[2] },
  { id: "u4", name: "Kyle Roberts", email: "kyle.r@example.com", joined: "May 2026", plan: "Free", verified: false, status: "suspended", reports: 5, photo: AVATARS[3] },
  { id: "u5", name: "Zanele Mabaso", email: "zanele@example.com", joined: "Feb 2026", plan: "Premium", verified: true, status: "active", reports: 0, photo: AVATARS[0] },
  { id: "u6", name: "Anonymous_2891", email: "temp8291@mail.ru", joined: "Yesterday", plan: "Free", verified: false, status: "banned", reports: 8, photo: AVATARS[3] },
];

const initialReports: Report[] = [
  { id: "r1", reporter: "Amahle Zulu", target: "Anonymous_2891", reason: "Scam / Money request", details: "Asked me to send airtime after 2 messages.", date: "Today", severity: "high", status: "open" },
  { id: "r2", reporter: "Lerato Khumalo", target: "Kyle Roberts", reason: "Inappropriate photos", details: "Sent explicit content unsolicited.", date: "Yesterday", severity: "high", status: "reviewing" },
  { id: "r3", reporter: "Jason Pretorius", target: "user_44821", reason: "Fake profile", details: "Photos appear to be stolen from a public Instagram.", date: "2 days ago", severity: "medium", status: "open" },
  { id: "r4", reporter: "Zanele Mabaso", target: "user_19402", reason: "Harassment", details: "Repeated messages after being blocked.", date: "3 days ago", severity: "medium", status: "resolved" },
];

const initialFake: FakeCandidate[] = [
  { id: "f1", name: "Anonymous_2891", reason: "Reverse image match • Disposable email • 8 reports", confidence: 96, photo: AVATARS[3] },
  { id: "f2", name: "love_angel_99", reason: "Duplicate photos across 3 accounts", confidence: 88, photo: AVATARS[2] },
  { id: "f3", name: "richguy_sa", reason: "Money requests detected in messages", confidence: 82, photo: AVATARS[1] },
];

function AdminDashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [pending, setPending] = useState(initialPending);
  const [users, setUsers] = useState(initialUsers);
  const [reports, setReports] = useState(initialReports);
  const [fake, setFake] = useState(initialFake);
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "Free" | "Premium" | "VIP">("all");

  const stats = useMemo(() => ({
    totalUsers: 12480,
    pendingVerifications: pending.filter((p) => p.status === "pending").length,
    openReports: reports.filter((r) => r.status !== "resolved").length,
    fakeFlagged: fake.length,
  }), [pending, reports, fake]);

  const filteredUsers = users.filter((u) => {
    const q = query.toLowerCase();
    const matchesQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesPlan = planFilter === "all" || u.plan === planFilter;
    return matchesQ && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Admin area · Restricted</span>
            </div>
            <h1 className="mt-1 font-display text-4xl font-bold">
              Admin <span className="text-gradient-brand">Dashboard</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Verify profiles, moderate reports, and keep LoveConnect SA safe.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-border px-3 py-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              All systems normal
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard icon={<Users className="h-5 w-5" />} label="Total Members" value={stats.totalUsers.toLocaleString()} trend="+124 this week" />
          <StatCard icon={<UserCheck className="h-5 w-5" />} label="Pending Verifications" value={stats.pendingVerifications} trend="Needs review" accent />
          <StatCard icon={<Flag className="h-5 w-5" />} label="Open Reports" value={stats.openReports} trend="2 high priority" accent />
          <StatCard icon={<Ban className="h-5 w-5" />} label="Flagged as Fake" value={stats.fakeFlagged} trend="AI + user reports" />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-2">
          {([
            ["overview", "Overview", TrendingUp],
            ["verification", "Verification", UserCheck],
            ["users", "Users", Users],
            ["reports", "Reports", Flag],
            ["fake", "Fake Accounts", Ban],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-gradient-brand text-white shadow-soft"
                  : "text-foreground/70 hover:bg-white hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewPanel pending={pending} reports={reports} onJump={setTab} />}

        {tab === "verification" && (
          <Card>
            <SectionHeader title="Profile verification queue" subtitle="Approve or reject members who submitted ID + selfie." />
            <div className="grid gap-4 md:grid-cols-2">
              {pending.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border bg-white p-4 flex gap-4">
                  <img src={p.photo} alt={p.name} className="h-24 w-24 rounded-2xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold truncate">{p.name}, {p.age}</h3>
                        <p className="text-xs text-muted-foreground">{p.city}</p>
                      </div>
                      <StatusPill status={p.status} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {p.submitted} · {p.idDoc}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setPending((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "approved" } : x))}
                        className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-soft"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => setPending((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "rejected" } : x))}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "users" && (
          <Card>
            <SectionHeader title="Manage users" subtitle="Search, filter, suspend, or ban accounts." />
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or email"
                  className="w-full rounded-full border border-border bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2 py-1">
                <Filter className="h-4 w-4 text-muted-foreground ml-1" />
                {(["all", "Free", "Premium", "VIP"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlanFilter(p)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${planFilter === p ? "bg-gradient-brand text-white" : "text-foreground/70 hover:bg-muted"}`}
                  >
                    {p === "all" ? "All plans" : p}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Reports</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={u.photo} alt="" className="h-9 w-9 rounded-full object-cover" />
                          <div>
                            <div className="font-medium flex items-center gap-1.5">
                              {u.name}
                              {u.verified && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                            </div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          u.plan === "VIP" ? "bg-purple-100 text-purple-700" :
                          u.plan === "Premium" ? "bg-pink-100 text-pink-700" :
                          "bg-muted text-muted-foreground"
                        }`}>{u.plan}</span>
                      </td>
                      <td className="px-4 py-3"><UserStatusPill status={u.status} /></td>
                      <td className="px-4 py-3">
                        {u.reports > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5" /> {u.reports}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status: x.status === "suspended" ? "active" : "suspended" } : x))}
                            className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted"
                          >
                            {u.status === "suspended" ? "Reinstate" : "Suspend"}
                          </button>
                          <button
                            onClick={() => setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status: "banned" } : x))}
                            className="rounded-full bg-destructive/10 text-destructive px-3 py-1 text-xs font-semibold hover:bg-destructive/20"
                          >
                            Ban
                          </button>
                          <button className="rounded-full p-1.5 hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No members match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "reports" && (
          <Card>
            <SectionHeader title="Member reports" subtitle="Review flags submitted by the community." />
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{r.reason}</span>
                        <SeverityPill severity={r.severity} />
                        <ReportStatusPill status={r.status} />
                      </div>
                      <p className="mt-1 text-sm text-foreground/80">{r.details}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">{r.reporter}</span> reported <span className="font-medium">{r.target}</span> · {r.date}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setReports((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "reviewing" } : x))}
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => setReports((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "resolved" } : x))}
                        className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-soft"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                      </button>
                      <button className="rounded-full bg-destructive/10 text-destructive p-1.5 hover:bg-destructive/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "fake" && (
          <Card>
            <SectionHeader title="Suspected fake accounts" subtitle="Auto-detected by our safety systems. Confirm to remove." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fake.map((f) => (
                <div key={f.id} className="rounded-2xl border border-border bg-white p-4">
                  <div className="flex items-center gap-3">
                    <img src={f.photo} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{f.name}</h3>
                      <p className="text-xs text-destructive font-medium">{f.confidence}% likely fake</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{f.reason}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-brand" style={{ width: `${f.confidence}%` }} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setFake((prev) => prev.filter((x) => x.id !== f.id))}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-destructive text-destructive-foreground px-3 py-2 text-xs font-semibold hover:opacity-90"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                    <button
                      onClick={() => setFake((prev) => prev.filter((x) => x.id !== f.id))}
                      className="rounded-full border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
              {fake.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  All clear — no suspicious accounts right now.
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; trend: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border bg-white p-5 ${accent ? "ring-1 ring-primary/20" : ""}`}>
      <div className="flex items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${accent ? "bg-gradient-brand text-white" : "bg-muted text-foreground/70"}`}>
          {icon}
        </span>
      </div>
      <div className="mt-4 text-2xl font-bold font-display">{value}</div>
      <div className="text-sm text-foreground/70">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{trend}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl bg-white border border-border p-6 shadow-soft">{children}</div>;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function StatusPill({ status }: { status: PendingProfile["status"] }) {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[status]}`}>{status}</span>;
}

function UserStatusPill({ status }: { status: ManagedUser["status"] }) {
  const map = {
    active: "bg-emerald-100 text-emerald-700",
    suspended: "bg-amber-100 text-amber-700",
    banned: "bg-rose-100 text-rose-700",
  } as const;
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[status]}`}>{status}</span>;
}

function SeverityPill({ severity }: { severity: Report["severity"] }) {
  const map = {
    low: "bg-muted text-foreground/70",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-rose-100 text-rose-700",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${map[severity]}`}>{severity}</span>;
}

function ReportStatusPill({ status }: { status: Report["status"] }) {
  const map = {
    open: "bg-pink-100 text-pink-700",
    reviewing: "bg-purple-100 text-purple-700",
    resolved: "bg-emerald-100 text-emerald-700",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${map[status]}`}>{status}</span>;
}

function OverviewPanel({ pending, reports, onJump }: { pending: PendingProfile[]; reports: Report[]; onJump: (t: TabKey) => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Latest verification requests</h2>
            <p className="text-xs text-muted-foreground">Waiting for admin approval</p>
          </div>
          <button onClick={() => onJump("verification")} className="text-xs font-semibold text-primary hover:underline">View all</button>
        </div>
        <div className="space-y-3">
          {pending.slice(0, 4).map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <img src={p.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.city} · {p.submitted}</div>
              </div>
              <StatusPill status={p.status} />
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Recent reports</h2>
            <p className="text-xs text-muted-foreground">Flagged by the community</p>
          </div>
          <button onClick={() => onJump("reports")} className="text-xs font-semibold text-primary hover:underline">View all</button>
        </div>
        <div className="space-y-3">
          {reports.slice(0, 4).map((r) => (
            <div key={r.id} className="flex items-start gap-3">
              <span className="mt-1 grid h-8 w-8 place-items-center rounded-full bg-rose-100 text-rose-700">
                <Flag className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{r.reason}</div>
                <div className="text-xs text-muted-foreground truncate">{r.target} · {r.date}</div>
              </div>
              <SeverityPill severity={r.severity} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
