import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Search, CheckCircle, XCircle, Clock, Monitor, Calendar, ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";

interface Booking {
  id: number;
  name: string;
  phone: string;
  telegram: string | null;
  zone: string;
  zones: string[] | null;
  pcsByZone: Record<string, number[]> | null;
  date: string | null;
  time: string | null;
  duration: number | null;
  comment: string | null;
  status: string;
  createdAt: string;
}

const zoneLabels: Record<string, string> = {
  standard: "Стандарт ПК", vip: "VIP ПК",
  playstation: "PlayStation", vip_playstation: "VIP PlayStation",
};

const statusConfig = {
  pending:   { label: "Ожидает подтверждения", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", icon: Clock },
  confirmed: { label: "Подтверждено",           color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30",   icon: CheckCircle },
  cancelled: { label: "Отменено",               color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30",       icon: XCircle },
};

export default function BookingStatus() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    setBookings(null);
    try {
      const res = await fetch(`/api/booking/status?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json() as { ok: boolean; bookings?: Booking[]; error?: string };
      if (data.ok) {
        setBookings(data.bookings ?? []);
      } else {
        setError(data.error ?? "Ошибка");
      }
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-16">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" /> На главную
          </a>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-white mb-2" style={{ textShadow: "0 0 20px rgba(139,92,246,0.6)" }}>
            Статус бронирования
          </h1>
          <p className="text-muted-foreground mb-8">Введите номер телефона, чтобы проверить ваши заявки</p>

          <form onSubmit={search} className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-primary/5 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/80 disabled:opacity-50 transition-all flex items-center gap-2"
              style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
            >
              <Search className="w-4 h-4" />
              {loading ? "Ищем..." : "Найти"}
            </button>
          </form>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {bookings !== null && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Заявок с этим номером не найдено</p>
                </div>
              ) : (
                bookings.map((b) => {
                  const sc = statusConfig[b.status as keyof typeof statusConfig] ?? statusConfig.pending;
                  const StatusIcon = sc.icon;
                  const zones = b.zones ?? [b.zone];
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-white/10 bg-[#0d0d18] p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-muted-foreground text-sm">Заявка #{b.id}</span>
                        <span className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border font-medium ${sc.bg} ${sc.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {sc.label}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-sm">
                        {zones.map((z) => {
                          const pcs = b.pcsByZone?.[z] ?? [];
                          return (
                            <div key={z} className="flex items-center gap-2 text-muted-foreground">
                              <Monitor className="w-3.5 h-3.5 text-primary" />
                              {zoneLabels[z] ?? z}
                              {pcs.length > 0 && <span className="text-primary/70">· ПК №{pcs.sort((a,b)=>a-b).join(", №")}</span>}
                            </div>
                          );
                        })}
                        {b.date && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {b.date}{b.time ? ` в ${b.time}` : ""}
                            {b.duration ? ` · ${b.duration} ч.` : ""}
                          </div>
                        )}
                        {b.telegram && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Send className="w-3.5 h-3.5 text-primary" />
                            @{b.telegram}
                          </div>
                        )}
                        {b.comment && (
                          <p className="text-muted-foreground italic">"{b.comment}"</p>
                        )}
                      </div>

                      <p className="text-xs text-white/20">
                        Создано {new Date(b.createdAt).toLocaleString("ru")}
                      </p>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
