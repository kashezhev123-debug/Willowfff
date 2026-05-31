import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Loader2 } from "lucide-react";

interface PcGridProps {
  zone: string;
  maxPcs: number;
  date: string;
  time: string;
  selected: number[];
  onSelect: (pcs: number[]) => void;
}

type PcStatus = "free" | "booked" | "selected";

export default function PcGrid({ zone, maxPcs, date, time, selected, onSelect }: PcGridProps) {
  const [bookedPcs, setBookedPcs] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ zone });
        if (date) params.set("date", date);
        if (time) params.set("time", time);
        const res = await fetch(`/api/pcs/status?${params}`);
        const data = await res.json() as { ok: boolean; bookedPcs: number[] };
        if (data.ok) setBookedPcs(data.bookedPcs);
      } catch {
        setBookedPcs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [zone, date, time]);

  const getStatus = (pcNum: number): PcStatus => {
    if (selected.includes(pcNum)) return "selected";
    if (bookedPcs.includes(pcNum)) return "booked";
    return "free";
  };

  const togglePc = (pcNum: number) => {
    if (bookedPcs.includes(pcNum)) return;
    if (selected.includes(pcNum)) {
      onSelect(selected.filter((n) => n !== pcNum));
    } else {
      onSelect([...selected, pcNum]);
    }
  };

  const freePcs = Array.from({ length: maxPcs }, (_, i) => i + 1).filter(
    (n) => !bookedPcs.includes(n)
  );
  const allFreeSelected = freePcs.length > 0 && freePcs.every((n) => selected.includes(n));

  const toggleSelectAll = () => {
    if (allFreeSelected) {
      onSelect([]);
    } else {
      onSelect(freePcs);
    }
  };

  const cols = maxPcs <= 5 ? maxPcs : 6;

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          Загружаем статус мест...
        </div>
      )}

      {/* Select All button */}
      {!loading && freePcs.length > 1 && (
        <button
          type="button"
          onClick={toggleSelectAll}
          className={`w-full py-2 rounded-xl text-xs font-semibold border transition-all ${
            allFreeSelected
              ? "border-primary bg-primary/20 text-white"
              : "border-white/10 bg-white/5 text-muted-foreground hover:border-primary/40 hover:text-white"
          }`}
          style={allFreeSelected ? { boxShadow: "0 0 16px rgba(139,92,246,0.25)" } : {}}
        >
          {allFreeSelected ? "Снять выбор со всех" : `Выбрать все свободные (${freePcs.length})`}
        </button>
      )}

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: maxPcs }, (_, i) => i + 1).map((num) => {
          const status = getStatus(num);
          return (
            <motion.button
              key={num}
              type="button"
              onClick={() => togglePc(num)}
              disabled={status === "booked"}
              data-testid={`button-pc-${num}`}
              whileHover={status !== "booked" ? { scale: 1.08 } : {}}
              whileTap={status !== "booked" ? { scale: 0.95 } : {}}
              className={`
                relative flex flex-col items-center justify-center
                rounded-xl border py-2.5 px-1 transition-all duration-200
                ${status === "selected"
                  ? "border-primary bg-primary/20 text-white"
                  : status === "booked"
                  ? "border-white/5 bg-white/3 text-white/20 cursor-not-allowed"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-white cursor-pointer"
                }
              `}
              style={
                status === "selected"
                  ? { boxShadow: "0 0 16px rgba(139,92,246,0.35)" }
                  : {}
              }
            >
              <Monitor className="w-3.5 h-3.5 mb-1" />
              <span className="text-xs font-bold">{num}</span>
              {status === "booked" && (
                <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                  <span className="text-[8px] text-red-400/60 font-medium">занят</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-white/10 border border-white/10" />
          Свободен
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary" style={{ boxShadow: "0 0 6px rgba(139,92,246,0.4)" }} />
          Выбран
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-white/3 border border-white/5" />
          Забронирован
        </span>
      </div>

      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-primary font-medium"
        >
          Выбрано: ПК №{selected.sort((a, b) => a - b).join(", №")}
        </motion.div>
      )}
    </div>
  );
}
