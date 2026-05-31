import { Router } from "express";
import { db, bookingsTable } from "@workspace/db";

const router = Router();

const zoneLabels: Record<string, string> = {
  standard: "🖥 Стандарт ПК · от 125 ₽/ч",
  vip: "👑 VIP ПК · от 180 ₽/ч",
  playstation: "🎮 PlayStation · от 210 ₽/ч",
  vip_playstation: "🏆 VIP PlayStation · 500 ₽/ч",
};

router.post("/booking", async (req, res) => {
  const { name, phone, telegram, zone, pcNumbers, date, time, duration, comment } = req.body;

  if (!name || !phone || !zone) {
    res.status(400).json({ ok: false, error: "Заполните обязательные поля" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({ ok: false, error: "Бот не настроен" });
    return;
  }

  const text = [
    "🎮 <b>Новая заявка — WILLOW Gaming Club</b>",
    "",
    `👤 <b>Имя:</b> ${name}`,
    `📞 <b>Телефон:</b> ${phone}`,
    telegram ? `✈️ <b>Telegram:</b> @${telegram}` : null,
    `🕹 <b>Тариф:</b> ${zoneLabels[zone] ?? zone}`,
    date ? `📅 <b>Дата:</b> ${date}` : null,
    time ? `⏰ <b>Время:</b> ${time}` : null,
    duration ? `⏱ <b>Длительность:</b> ${duration} ч.` : null,
    comment ? `💬 <b>Комментарий:</b> ${comment}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    // Save to database
    await db.insert(bookingsTable).values({
      name,
      phone,
      telegram: telegram ?? null,
      zone,
      pcNumbers: pcNumbers ?? [],
      date: date ?? null,
      time: time ?? null,
      duration: duration ? Number(duration) : null,
      comment: comment ?? null,
      status: "pending",
    });

    // Send to Telegram
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

export default router;
