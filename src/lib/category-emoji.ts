const RULES: Array<{ match: RegExp; emoji: string }> = [
  { match: /bolo/i, emoji: "🍰" },
  { match: /torta/i, emoji: "🥧" },
  { match: /brigadeiro|doce fin/i, emoji: "🍬" },
  { match: /cupcake/i, emoji: "🧁" },
  { match: /chocolat/i, emoji: "🍫" },
  { match: /salgad/i, emoji: "🥟" },
  { match: /bebida|suco|refrigerante/i, emoji: "🥤" },
  { match: /biscoit|cooki/i, emoji: "🍪" },
];

export function categoryEmoji(name: string): string {
  const rule = RULES.find((r) => r.match.test(name));
  return rule?.emoji ?? "💗";
}
