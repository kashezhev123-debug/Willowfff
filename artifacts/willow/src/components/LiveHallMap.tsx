import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Gamepad2, RefreshCw, Wifi } from "lucide-react";

interface ZoneStatus {
  zone: string;
  label: string;
  icon: typeof Monitor;
  maxPcs: number;
  bookedPcs: number[];
  blockedPcs: number[];
  color: string;
}

const ZONES = [
  { zone: "standard", label: "Стандарт ПК", maxPcs: 18, icon: Monitor, color: "#8b5cf6" },
  { zone: "vip", label: "VIP ПК", maxPcs: 5, icon: Monitor, color: "#a78bfa" },
  { zone: "playstation", label: "PlayStation", maxPcs: 1, icon: Gamepad2, color: "#3b82f6" },
  { zone: "vip_playstation", label: "VIP PlayStation", maxPcs: 1, icon: Gamepad2, color: "#06b6d4" },
];

async function fetchZoneStatus(zone: string): Promise<{ bookedPcs: number[]; blockedPcs: number[] }> {
  const [statusRes, blockedRes] = await Promise.all([
    fetch(`/api/pcs/status?zone=${zone}`).then((r) => r.json()),
    fetch(`/api/pcs/blocked?zone=${zone}`).then((r) => r.json()),
  ]);
  return {
    bookedPcs: statusRes.bookedPcs ?? [],
    blockedPcs: blockedRes.blockedPcs ?? [],
  };
}

export default function LiveHallMap() {
  const [statuses, setStatuses] = useState<Record<string, { bookedPcs: number[]; blockedPcs: number[] }>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refresh = async () => {
    setLoading(true);
    const results: Record<string, { bookedPcs: number[]; blockedPcs: number[] }> = {};
    await Promise.all(
      ZONES.map(async (z) => {
        results[z.zone] = await fetchZoneStatus(z.zone).catch(() => ({ bookedPcs: [], blockedPcs: [] }));
      })
    );
    setStatuses(results);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, []);

  const totalFree = ZONES.reduce((acc, z) => {
    const s = statuses[z.zone] ?? { bookedPcs: [], blockedPcs: [] };
    const taken = new Set([...s.bookedPcs, ...s.blockedPcs]).size;
    return acc + Math.max(0, z.maxPcs - taken);
  }, 0);
  const totalPlaces = ZONES.reduce((a, z) => a + z.maxPcs, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400 font-medium">Свободно {totalFree} из {totalPlaces} мест</span>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1">
              Обновлено в {lastUpdate.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })} · обновляется каждые 30 сек
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Обновить
        </button>
      </div>

      {/* Zone grids */}
      <div className="space-y-5">
        {ZONES.map((z) => {
          const s = statuses[z.zone] ?? { bookedPcs: [], blockedPcs: [] };
          const freePcs = Array.from({ length: z.maxPcs }, (_, i) => i + 1).filter(
            (n) => !s.bookedPcs.includes(n) && !s.blockedPcs.includes(n)
          );
          const freeCount = freePcs.length;
          const Icon = z.icon;

          return (
            <div key={z.zone} className="rounded-xl border border-white/8 bg-white/3 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: z.color }} />
                  <span className="font-semibold text-white text-sm">{z.label}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  freeCount === 0 ? "bg-red-400/10 text-red-400" : "bg-green-400/10 text-green-400"
                }`}>
                  {freeCount === 0 ? "Всё занято" : `${freeCount} свободно`}
                </span>
              </div>

              {z.maxPcs === 1 ? (
                // Single station (PlayStation)
                <div className="flex items-center gap-3">
                  {(() => {
                    const isBooked = s.bookedPcs.includes(1);
                    const isBlocked = s.blockedPcs.includes(1);
                    return (
                      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium ${
                        isBlocked ? "border-white/5 bg-white/3 text-white/20" :
                        isBooked ? "border-red-400/30 bg-red-400/10 text-red-300" :
                        "border-green-400/30 bg-green-400/10 text-green-300"
                      }`}>
                        <Icon className="w-4 h-4" />
                        {isBlocked ? "Недоступно" : isBooked ? "Занято" : "Свободно"}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                // PC grid
                <div
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${z.maxPcs <= 5 ? z.maxPcs : 6}, 1fr)` }}
                >
                  {Array.from({ length: z.maxPcs }, (_, i) => i + 1).map((n) => {
                    const isBlocked = s.blockedPcs.includes(n);
                    const isBooked = s.bookedPcs.includes(n);
                    return (
                      <motion.div
                        key={n}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: n * 0.02 }}
                        className={`flex flex-col items-center justify-center rounded-lg py-2 border text-xs font-bold transition-all ${
                          isBlocked
                            ? "border-white/5 bg-white/3 text-white/20"
                            : isBooked
                            ? "border-red-400/30 bg-red-400/10 text-red-300"
                            : "border-green-400/30 bg-green-400/10 text-green-300"
                        }`}
                        title={isBlocked ? "На ремонте" : isBooked ? "Забронирован" : "Свободен"}
                      >
                        <Monitor className="w-3 h-3 mb-0.5" />
                        {n}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              {z.maxPcs > 1 && (
                <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-400/20 border border-green-400/30" />Свободен</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400/20 border border-red-400/30" />Занят</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-white/5 border border-white/5" />Ремонт</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
