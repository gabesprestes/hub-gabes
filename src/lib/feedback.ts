export function draftFeedback(name: string, notes: string, mentions: string) {
  const lines = [...notes.split("\n"), ...mentions.split("\n")]
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "Cole anotações ou menções deste analista antes de gerar o rascunho.";
  }

  const points = lines.slice(0, 6).map((line) => `- ${line.replace(/^[-*]\s*/, "")}`);

  return [
    `${name}, queria deixar registrado o que tenho acompanhado com você.`,
    "",
    "O que está forte:",
    points.slice(0, Math.ceil(points.length / 2)).join("\n"),
    "",
    "Onde quero te ver avançar:",
    points.slice(Math.ceil(points.length / 2)).join("\n") || "- Vamos escolher um ponto concreto no próximo 1:1.",
    "",
    "No próximo ciclo, seguimos com combinados claros e retorno curto depois de cada entrega.",
  ].join("\n");
}
