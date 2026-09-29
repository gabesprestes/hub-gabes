export const BIRTHDAYS = [
  { name: "Mayara Kin", month: 1, day: 8 },
  { name: "Luciana Ramos", month: 2, day: 12 },
  { name: "Evelyn Marconi", month: 2, day: 14 },
  { name: "Francilene Santos", month: 3, day: 2 },
  { name: "Livia Lyra", month: 5, day: 16 },
  { name: "Matheus Santos", month: 6, day: 20 },
  { name: "Mariana Dilello", month: 10, day: 6 },
  { name: "Alan Clovis", month: 11, day: 13 },
];

export function birthdayReminderText(name: string) {
  return `Hoje é o aniversário de: ${name}!`;
}

export function birthdaysOn(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  return BIRTHDAYS.filter((item) => item.month === month && item.day === day).map((item) => item.name);
}
