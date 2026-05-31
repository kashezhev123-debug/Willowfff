import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Monitor, Calendar, Clock, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import PcGrid from "./PcGrid";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const zones = [
  { value: "standard", label: "Стандарт ПК", desc: "18 мест · от 125 ₽/ч", maxPc: 18 },
  { value: "vip", label: "VIP ПК", desc: "5 мест · от 180 ₽/ч", maxPc: 5 },
  { value: "playstation", label: "PlayStation", desc: "1 место · от 210 ₽/ч", maxPc: 0 },
  { value: "vip_playstation", label: "VIP PlayStation", desc: "1 место · 500 ₽/ч", maxPc: 0 },
];

const durations = ["1", "2", "3", "4", "5", "6", "8", "10"];

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    zone: "",
    pcNumbers: [] as number[],
    date: "",
    time: "",
    duration: "",
    comment: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const selectedZone = zones.find((z) => z.value === form.zone);
  const showPcGrid = selectedZone && selectedZone.maxPc > 0;

  const handleZoneSelect = (zoneValue: string) => {
    setForm((prev) => ({ ...prev, zone: zoneValue, pcNumbers: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.zone) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        setStatus("success");
        setForm({ name: "", phone: "", zone: "", pcNumbers: [], date: "", time: "", duration: "", comment: "" });
      } else {
        setStatus("error");
        setErrorMsg(data.error ?? "Ошибка отправки");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Нет соединения с сервером");
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setStatus("idle"), 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-primary/30 bg-[#0d0d18]"
            style={{ boxShadow: "0 0 60px rgba(139,92,246,0.2), 0 0 120px rgba(139,92,246,0.05)" }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white" style={{ textShadow: "0 0 20px rgba(139,92,246,0.8)" }}>
                  Забронировать
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">Заявка придёт нам в Telegram</p>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground"
                data-testid="button-close-modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success State */}
            {status === "success" ? (
              <motion.div
                className="p-10 flex flex-col items-center text-center gap-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center" style={{ boxShadow: "0 0 40px rgba(139,92,246,0.4)" }}>
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white">Заявка отправлена!</h3>
                <p className="text-muted-foreground">Мы свяжемся с вами в ближайшее время для подтверждения бронирования.</p>
                <button
                  onClick={handleClose}
                  className="mt-4 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
                  data-testid="button-close-success"
                >
                  Закрыть
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-primary" /> Ваше имя <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Как к вам обращаться?"
                    data-testid="input-name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-primary/5 transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary" /> Телефон <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    data-testid="input-phone"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-primary/5 transition-all"
                  />
                </div>

                {/* Zone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5 text-primary" /> Зона <span className="text-primary">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {zones.map((z) => (
                      <button
                        type="button"
                        key={z.value}
                        onClick={() => handleZoneSelect(z.value)}
                        data-testid={`button-zone-${z.value}`}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          form.zone === z.value
                            ? "border-primary bg-primary/15 text-white"
                            : "border-white/10 bg-white/3 text-muted-foreground hover:border-primary/40"
                        }`}
                        style={form.zone === z.value ? { boxShadow: "0 0 20px rgba(139,92,246,0.2)" } : {}}
                      >
                        <div className="font-semibold text-sm">{z.label}</div>
                        <div className="text-xs opacity-70 mt-0.5">{z.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time — shown before PC grid so status loads correctly */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Дата
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => set("date", e.target.value)}
                      data-testid="input-date"
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/60 focus:bg-primary/5 transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Время
                    </label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => set("time", e.target.value)}
                      data-testid="input-time"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/60 focus:bg-primary/5 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* PC Grid — only for standard/vip */}
                <AnimatePresence>
                  {showPcGrid && (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Monitor className="w-3.5 h-3.5 text-primary" />
                          Выберите место
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {form.pcNumbers.length > 0
                            ? `Выбрано: ${form.pcNumbers.length}`
                            : "Можно несколько"}
                        </span>
                      </label>
                      <PcGrid
                        zone={form.zone}
                        maxPcs={selectedZone.maxPc}
                        date={form.date}
                        time={form.time}
                        selected={form.pcNumbers}
                        onSelect={(pcs) => setForm((prev) => ({ ...prev, pcNumbers: pcs }))}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Длительность (часов)</label>
                  <div className="flex flex-wrap gap-2">
                    {durations.map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => set("duration", d)}
                        data-testid={`button-duration-${d}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          form.duration === d
                            ? "border-primary bg-primary/20 text-white"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {d} ч
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" /> Комментарий
                  </label>
                  <textarea
                    value={form.comment}
                    onChange={(e) => set("comment", e.target.value)}
                    placeholder="Пожелания, вопросы..."
                    rows={2}
                    data-testid="input-comment"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-primary/5 transition-all resize-none"
                  />
                </div>

                {/* Error */}
                {status === "error" && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
                    {errorMsg}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "loading" || !form.name || !form.phone || !form.zone}
                  data-testid="button-submit-booking"
                  className="w-full py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  style={{ boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Отправляем...
                    </>
                  ) : (
                    "Отправить заявку"
                  )}
                </button>

                <p className="text-xs text-center text-muted-foreground">
                  Работаем 24/7 · Ответим в течение нескольких минут
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
