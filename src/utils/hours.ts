import type { DayKey, Hours } from "../types/restroom";

const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isOpenNow(hours: Hours, now: Date = new Date()): boolean {
  if (hours.alwaysOpen) return true;

  const dayKey = DAY_KEYS[now.getDay()];
  const today = hours.schedule?.[dayKey];
  if (!today) return false;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const open = toMinutes(today.open);
  const close = toMinutes(today.close);

  // Handle overnight ranges (e.g. open 06:00, close 02:00 the next day)
  if (close <= open) {
    return nowMinutes >= open || nowMinutes < close;
  }
  return nowMinutes >= open && nowMinutes < close;
}

export function formatHoursToday(hours: Hours, now: Date = new Date()): string {
  if (hours.alwaysOpen) return "Open 24 hours";

  const dayKey = DAY_KEYS[now.getDay()];
  const today = hours.schedule?.[dayKey];
  if (!today) return "Closed today";

  return `${formatTime(today.open)} – ${formatTime(today.close)}`;
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export function formatFullSchedule(hours: Hours): { day: string; text: string }[] {
  if (hours.alwaysOpen) {
    return [{ day: "Every day", text: "Open 24 hours" }];
  }
  const orderedKeys: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  return orderedKeys.map((key) => {
    const entry = hours.schedule?.[key];
    return {
      day: DAY_LABELS[key],
      text: entry ? `${formatTime(entry.open)} – ${formatTime(entry.close)}` : "Closed",
    };
  });
}
