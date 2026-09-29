export function birthdayReminderText(name: string) {
  return `Hoje é o aniversário de: ${name}!`;
}

export const BIRTHDAYS = [
  { month: 1, day: 8, text: birthdayReminderText("Mayara Kin") },
  { month: 2, day: 12, text: birthdayReminderText("Luciana Ramos") },
  { month: 2, day: 14, text: birthdayReminderText("Evelyn Marconi") },
  { month: 3, day: 2, text: birthdayReminderText("Francilene Santos") },
  { month: 5, day: 16, text: birthdayReminderText("Livia Lyra") },
  { month: 6, day: 17, text: "Feliz aniversário, Gabrielle!" },
  { month: 6, day: 20, text: birthdayReminderText("Matheus Santos") },
  { month: 10, day: 6, text: birthdayReminderText("Mariana Dilello") },
  { month: 11, day: 13, text: birthdayReminderText("Alan Clovis") },
];

const PREVIEW = {
  year: 2026,
  month: 9,
  day: 29,
  text: birthdayReminderText("Mayara Kin"),
};

function saoPauloDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

export function birthdayTextsOn(date = new Date()) {
  const today = saoPauloDate(date);
  const texts = BIRTHDAYS.filter((item) => item.month === today.month && item.day === today.day).map((item) => item.text);
  if (today.year === PREVIEW.year && today.month === PREVIEW.month && today.day === PREVIEW.day) {
    texts.unshift(PREVIEW.text);
  }
  return texts;
}
