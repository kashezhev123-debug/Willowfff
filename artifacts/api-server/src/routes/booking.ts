import { Router } from "express";
import { db, bookingsTable } from "@workspace/db";

const router = Router();

const zoneLabels: Record<string, string> = {
  standard: "🖥 Стандарт ПК · от 125 ₽/ч",
  vip: "👑 VIP ПК · от 180 ₽/ч",
  playstation: "🎮 PlayStation · от 210 ₽/ч",
  vip_playstation: "🏆 VIP PlayStation · 500 ₽/ч",
};

const zoneShort: Record<string, string> = {
  standard: "Стандарт ПК",
  vip: "VIP ПК",
  playstation: "PlayStation",
  vip_playstation: "VIP PlayStation",
};

router.post("/booking", async (req, res) => {
  const { name, phone, telegram, zones, pcsByZone, date, time, duration, comment } = req.body as {
    name: string;
    phone: string;
    telegram?: string;
    zones: string[];
    pcsByZone: Record<string, number[]>;
    date?: string;
    time?: string;
    duration?: string;
    comment?: string;
  };

  if (!name || !phone || !zones || zones.length === 0) {
    res.status(400).json({ ok: false, error: "Заполните обязательные поля" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ ok: false, error: "Бот не настроен" });
    return;
  }

  // Build zones block for message
  const zonesBlock = zones.map((z) => {
    const label = zoneLabels[z] ?? z;
    const pcs = (pcsByZone?.[z] ?? []).sort((a, b) => a - b);
    if (pcs.length > 0) {
      return `${label}\n     ПК №${pcs.join(", №")}`;
    }
    return label;
  }).join("\n");

  const text = [
    "🎮 <b>Новая заявка — WILLOW Gaming Club</b>",
    "",
    `👤 <b>Имя:</b> ${name}`,
    `📞 <b>Телефон:</b> ${phone}`,
    telegram ? `✈️ <b>Telegram:</b> @${telegram}` : null,
    "",
    `🕹 <b>Зона:</b>`,
    zonesBlock,
    date ? `\n📅 <b>Дата:</b> ${date}` : null,
    time ? `⏰ <b>Время:</b> ${time}` : null,
    duration ? `⏱ <b>Длительность:</b> ${duration} ч.` : null,
    comment ? `💬 <b>Комментарий:</b> ${comment}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    await db.insert(bookingsTable).values({
      name,
      phone,
      telegram: telegram ?? null,
      zone: zones[0],
      zones,
      pcNumbers: [],
      pcsByZone: pcsByZone ?? {},
      date: date ?? null,
      time: time ?? null,
      duration: duration ? Number(duration) : null,
      comment: comment ?? null,
      status: "pending",
    });

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      }
    );

    const result = await response.json() as { ok: boolean; description?: string };
    if (!result.ok) {
      res.status(500).json({ ok: false, error: result.description });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Ошибка сервера" });
  }
});

export { zoneShort };
export default router;
