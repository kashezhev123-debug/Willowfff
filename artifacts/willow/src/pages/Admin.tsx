import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn, RefreshCw, CheckCircle, XCircle, Clock,
  Trash2, Phone, User, Monitor, Calendar, MessageSquare,
  LogOut, Shield, Send, Download, BarChart2, Lock, Unlock,
  AlertTriangle, TrendingUp
} from "lucide-react";

interface Booking {
  id: number;
  name: string;
  phone: string;
  telegram: string | null;
  zone: string;
  zones: string[] | null;
  pcNumbers: number[] | null;
  pcsByZone: Record<string, number[]> | null;
  date: string | null;
  time: string | null;
  duration: number | null;
  comment: string | null;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  byZone: Record<string, number>;
  perDay: { date: string; count: number }[];
  peakHours: { hour: string; count: number }[];
}

interface BlockedPc {
  id: number;
  zone: string;
  pcNumber: number;
  reason: string | null;
  createdAt: string;
}

const zoneLabels: Record<string, string> = {
  standard: "Стандарт ПК",
  vip: "VIP ПК",
  playstation: "PlayStation",
  vip_playstation: "VIP PlayStation",
};

const zoneMaxPc: Record<string, number> = {
  standard: 18,
  vip: 5,
  playstation: 1,
  vip_playstation: 1,
};

const statusConfig = {
  pending:   { label: "Ожидает",     color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  confirmed: { label: "Подтверждён", color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30" },
  cancelled: { label: "Отменён",     color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30" },
};

function ZoneDisplay({ booking }: { booking: Booking }) {
  if (booking.zones && booking.zones.length > 0) {
    return (
      <div className="space-y-1">
        {booking.zones.map((z) => {
          const pcs = booking.pcsByZone?.[z] ?? [];
          return (
            <div key={z} className="flex items-start gap-1.5 text-muted-foreground text-sm">
              <Monitor className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <span>
                {zoneLabels[z] ?? z}
                {pcs.length > 0 && <span className="text-primary/70 ml-1">· ПК №{pcs.sort((a,b)=>a-b).join(", №")}</span>}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  const pcs = booking.pcNumbers ?? [];
  return (
    <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
      <Monitor className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
      <span>
        {zoneLabels[booking.zone] ?? booking.zone}
        {pcs.length > 0 && <span className="text-primary/70 ml-1">· ПК №{[...pcs].sort((a,b)=>a-b).join(", №")}</span>}
      </span>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") ?? "");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<"bookings" | "stats" | "blocking">("bookings");

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // PC Blocking
  const [blocked, setBlocked] = useState<BlockedPc[]>([]);
  const [blockZone, setBlockZone] = useState("standard");
  const [blockPc, setBlockPc] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);

  const fetchBookings = useCallback(async (tok: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json() as { ok: boolean; bookings?: Booking[] };
      if (data.ok && data.bookings) setBookings(data.bookings);
      else if (res.status === 401) { localStorage.removeItem("admin_token"); setToken(""); }
    } catch {} finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async (tok: string) => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json() as { ok: boolean; stats?: Stats };
      if (data.ok && data.stats) setStats(data.stats);
    } catch {} finally { setStatsLoading(false); }
  }, []);

  const fetchBlocked = useCallback(async (tok: string) => {
    try {
      const res = await fetch("/api/admin/blocked-pcs", { headers: { Authorization: `Bearer ${tok}` } });
      const data = await res.json() as { ok: boolean; blocked?: BlockedPc[] };
      if (data.ok && data.blocked) setBlocked(data.blocked);
    } catch {}
  }, []);

  useEffect(() => {
    if (token) {
      fetchBookings(token);
      fetchStats(token);
      fetchBlocked(token);
    }
  }, [token, fetchBookings, fetchStats, fetchBlocked]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json() as { ok: boolean; token?: string; error?: string };
      if (data.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        setToken(data.token);
      } else setLoginError(data.error ?? "Ошибка");
    } catch { setLoginError("Нет соединения с сервером"); }
    finally { setLoginLoading(false); }
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } finally { setUpdatingId(null); }
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Удалить бронирование?")) return;
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/bookings/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } finally { setUpdatingId(null); }
  };

  const handleExport = () => {
    window.open(`/api/admin/export?token=${encodeURIComponent(token)}`, "_blank");
    // Actually use a proper auth header via form POST trick
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    fetch("/api/admin/export", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = `willow_bookings_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
  };

  const blockPcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockPc) return;
    setBlockLoading(true);
    try {
      await fetch("/api/admin/blocked-pcs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ zone: blockZone, pcNumber: Number(blockPc), reason: blockReason || undefined }),
      });
      setBlockPc(""); setBlockReason("");
      fetchBlocked(token);
    } finally { setBlockLoading(false); }
  };

  const unblockPc = async (id: number) => {
    await fetch(`/api/admin/blocked-pcs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setBlocked((prev) => prev.filter((b) => b.id !== id));
  };

  const logout = () => { localStorage.removeItem("admin_token"); setToken(""); setBookings([]); };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_60%)]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-sm">
          <div className="rounded-2xl border border-primary/30 bg-[#0d0d18] p-8" style={{ boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}>
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4" style={{ boxShadow: "0 0 30px rgba(139,92,246,0.3)" }}>
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight" style={{ textShadow: "0 0 20px rgba(139,92,246,0.6)" }}>WILLOW Admin</h1>
              <p className="text-muted-foreground text-sm mt-1">Панель управления бронированиями</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль администратора" data-testid="input-admin-password" autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-all" />
              {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
              <button type="submit" disabled={loginLoading || !password} data-testid="button-admin-login"
                className="w-full py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/80 disabled:opacity-50 transition-all"
                style={{ boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
                <LogIn className="w-4 h-4" /> {loginLoading ? "Входим..." : "Войти"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d0d18]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight" style={{ textShadow: "0 0 15px rgba(139,92,246,0.6)" }}>WILLOW</span>
            <span className="text-muted-foreground text-sm">/ Администратор</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all text-sm">
              <Download className="w-4 h-4" /> Excel
            </button>
            <button onClick={() => { fetchBookings(token); fetchStats(token); fetchBlocked(token); }} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all text-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Обновить
            </button>
            <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all text-sm">
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 pb-0 flex gap-1">
          {([
            { id: "bookings", label: "Заявки", icon: User },
            { id: "stats",    label: "Статистика", icon: BarChart2 },
            { id: "blocking", label: "Блокировка ПК", icon: Lock },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                tab === id ? "border-primary text-white" : "border-transparent text-muted-foreground hover:text-white"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── BOOKINGS TAB ── */}
        {tab === "bookings" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["all", "pending", "confirmed", "cancelled"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`p-4 rounded-xl border text-left transition-all ${filter === f ? "border-primary bg-primary/15" : "border-white/10 bg-white/5 hover:border-primary/40"}`}>
                  <div className="text-2xl font-black text-white">{counts[f]}</div>
                  <div className="text-xs text-muted-foreground mt-1">{f === "all" ? "Всего" : statusConfig[f].label}</div>
                </button>
              ))}
            </div>

            {loading && bookings.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">Загружаем...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">{filter === "all" ? "Нет бронирований" : "Нет заявок в этой категории"}</div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filtered.map((booking) => {
                    const sc = statusConfig[booking.status as keyof typeof statusConfig] ?? statusConfig.pending;
                    const isUpdating = updatingId === booking.id;
                    return (
                      <motion.div key={booking.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-xl border border-white/10 bg-[#0d0d18] p-5">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-white font-bold text-lg">{booking.name}</span>
                              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                              <span className="text-xs text-muted-foreground ml-auto">#{booking.id} · {new Date(booking.createdAt).toLocaleString("ru")}</span>
                            </div>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Phone className="w-3.5 h-3.5 text-primary" />{booking.phone}
                                </span>
                                {booking.telegram && (
                                  <a href={`https://t.me/${booking.telegram}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-primary/80 hover:text-primary transition-colors">
                                    <Send className="w-3.5 h-3.5" />@{booking.telegram}
                                  </a>
                                )}
                              </div>
                              <ZoneDisplay booking={booking} />
                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {booking.date && (
                                  <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />{booking.date}{booking.time ? ` в ${booking.time}` : ""}
                                  </span>
                                )}
                                {booking.duration && (
                                  <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5 text-primary" />{booking.duration} ч.
                                  </span>
                                )}
                              </div>
                              {booking.comment && (
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0" />{booking.comment}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex md:flex-col gap-2 shrink-0">
                            {booking.status !== "confirmed" && (
                              <button onClick={() => updateStatus(booking.id, "confirmed")} disabled={isUpdating}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all text-sm disabled:opacity-50">
                                <CheckCircle className="w-4 h-4" />Подтвердить
                              </button>
                            )}
                            {booking.status !== "cancelled" && (
                              <button onClick={() => updateStatus(booking.id, "cancelled")} disabled={isUpdating}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm disabled:opacity-50">
                                <XCircle className="w-4 h-4" />Отменить
                              </button>
                            )}
                            <button onClick={() => deleteBooking(booking.id)} disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-all text-sm disabled:opacity-50">
                              <Trash2 className="w-4 h-4" />Удалить
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* ── STATS TAB ── */}
        {tab === "stats" && (
          <div className="space-y-6">
            {statsLoading || !stats ? (
              <div className="text-center py-20 text-muted-foreground">Загружаем статистику...</div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Всего заявок", value: stats.total, color: "text-white" },
                    { label: "Ожидает", value: stats.pending, color: "text-yellow-400" },
                    { label: "Подтверждено", value: stats.confirmed, color: "text-green-400" },
                    { label: "Отменено", value: stats.cancelled, color: "text-red-400" },
                  ].map((s) => (
                    <div key={s.label} className="p-4 rounded-xl border border-white/10 bg-[#0d0d18]">
                      <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Last 7 days chart */}
                <div className="rounded-xl border border-white/10 bg-[#0d0d18] p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-primary" /> Заявки за последние 7 дней
                  </h3>
                  <div className="flex items-end gap-2 h-32">
                    {stats.perDay.map((d) => {
                      const max = Math.max(...stats.perDay.map((x) => x.count), 1);
                      const pct = (d.count / max) * 100;
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs text-primary font-bold">{d.count > 0 ? d.count : ""}</span>
                          <div className="w-full rounded-t-md bg-primary/20 border border-primary/30 transition-all" style={{ height: `${Math.max(pct, 4)}%` }} />
                          <span className="text-[10px] text-muted-foreground">{d.date.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* By zone */}
                  <div className="rounded-xl border border-white/10 bg-[#0d0d18] p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                      <Monitor className="w-4 h-4 text-primary" /> По зонам
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(stats.byZone).sort((a,b) => b[1]-a[1]).map(([zone, count]) => {
                        const max = Math.max(...Object.values(stats.byZone), 1);
                        return (
                          <div key={zone}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">{zoneLabels[zone] ?? zone}</span>
                              <span className="text-white font-bold">{count}</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5">
                              <div className="h-full rounded-full bg-primary/70" style={{ width: `${(count / max) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Peak hours */}
                  <div className="rounded-xl border border-white/10 bg-[#0d0d18] p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-primary" /> Часы пик
                    </h3>
                    {stats.peakHours.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Нет данных о времени</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.peakHours.map((h, i) => (
                          <div key={h.hour} className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-primary text-white" : "bg-white/10 text-muted-foreground"}`}>{i+1}</span>
                            <span className="text-white font-medium">{h.hour}</span>
                            <span className="text-muted-foreground text-sm ml-auto">{h.count} заявок</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BLOCKING TAB ── */}
        {tab === "blocking" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-[#0d0d18] p-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-primary" /> Заблокировать ПК (на ремонт)
              </h3>
              <form onSubmit={blockPcSubmit} className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Зона</label>
                  <select value={blockZone} onChange={(e) => setBlockZone(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/60 transition-all">
                    {Object.entries(zoneLabels).map(([v, l]) => (
                      <option key={v} value={v} className="bg-[#0d0d18]">{l}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Номер ПК</label>
                  <input type="number" min={1} max={zoneMaxPc[blockZone] ?? 18} value={blockPc} onChange={(e) => setBlockPc(e.target.value)} placeholder="№"
                    className="w-20 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/60 transition-all" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-[140px]">
                  <label className="text-xs text-muted-foreground">Причина</label>
                  <input type="text" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Ремонт, поломка..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/60 transition-all" />
                </div>
                <button type="submit" disabled={blockLoading || !blockPc}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm disabled:opacity-50">
                  <AlertTriangle className="w-4 h-4" /> {blockLoading ? "..." : "Заблокировать"}
                </button>
              </form>
            </div>

            {/* Blocked list */}
            {blocked.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Unlock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Нет заблокированных ПК</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocked.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-white font-medium">{zoneLabels[b.zone] ?? b.zone} — ПК №{b.pcNumber}</span>
                      {b.reason && <span className="text-muted-foreground text-sm">· {b.reason}</span>}
                    </div>
                    <button onClick={() => unblockPc(b.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all text-xs">
                      <Unlock className="w-3.5 h-3.5" /> Разблокировать
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
