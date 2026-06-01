import { db, bookingsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";

const zoneLabels: Record<string, string> = {
  standard: "Стандарт ПК", vip: "VIP ПК",
  playstation: "PlayStation", vip_playstation: "VIP PlayStation",
};

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  }).catch(() => {});
}

function getTodayDateStr() {
  return new Date().toISOString().split("T")[0];
}

function getHourFromNow(hours: number) {
  const d = new Date(Date.now() + hours * 60 * 60 * 1000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

async function checkReminders() {
  try {
    const today = getTodayDateStr();
    // Get time 1 hour from now (check ±5 minutes window)
    const now = Date.now();
    const targetMs = now + 60 * 60 * 1000;
    const minTime = new Date(targetMs - 5 * 60 * 1000);
    const maxTime = new Date(targetMs + 5 * 60 * 1000);

    const bookings = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.date, today),
          inArray(bookingsTable.status, ["confirmed", "pending"]),
          eq(bookingsTable.reminderSent, "false")
        )
      );

    for (const booking of bookings) {
      if (!booking.time) continue;
      const [bh, bm] = booking.time.split(":").map(Number);
      const bookingMinutes = bh * 60 + bm;
      const minMinutes = minTime.getHours() * 60 + minTime.getMinutes();
      const maxMinutes = maxTime.getHours() * 60 + maxTime.getMinutes();

      if (bookingMinutes >= minMinutes && bookingMinutes <= maxMinutes) {
        const zones: string[] = (booking.zones as string[] | null) ?? [booking.zone];
        const zoneStr = zones.map((z) => zoneLabels[z] ?? z).join(", ");

        await sendTelegram(
          `⏰ <b>Напоминание — бронирование через 1 час</b>\n\n` +
          `📋 <b>Заявка #${booking.id}</b>\n` +
          `👤 ${booking.name}\n` +
          `📞 ${booking.phone}\n` +
          (booking.telegram ? `✈️ @${booking.telegram}\n` : "") +
          `🕹 ${zoneStr}\n` +
          `📅 ${booking.date} в ${booking.time}`
        );

        await db
          .update(bookingsTable)
          .set({ reminderSent: "true" })
          .where(eq(bookingsTable.id, booking.id));
      }
    }
  } catch (err) {
    console.error("[Reminder]", err);
  }
}

export function startReminderScheduler() {
  console.log("[Reminder] Scheduler started — checking every 60s");
  checkReminders();
  setInterval(checkReminders, 60 * 1000);
}
