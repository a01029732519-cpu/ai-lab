// 메시지 포맷 (Telegram HTML)
export const MAX_BODY = 3500;

export const LEVELS = {
  info: { icon: "ℹ️", silent: false },
  progress: { icon: "⏳", silent: true },
  done: { icon: "✅", silent: false },
  warn: { icon: "⚠️", silent: false },
  error: { icon: "❌", silent: false },
};

const SOURCE_NAMES = { claude: "Claude", gpt: "ChatGPT", chatgpt: "ChatGPT", grok: "Grok" };

export function esc(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function truncate(text, limit = MAX_BODY) {
  const s = String(text);
  return s.length <= limit ? s : s.slice(0, limit - 1) + "…";
}

export function sourceName(source) {
  return SOURCE_NAMES[source] ?? source;
}

export function formatNotify(source, level, message) {
  return `${LEVELS[level].icon} <b>${esc(sourceName(source))}</b>\n${esc(truncate(message))}`;
}

export function formatQuestion(source, question) {
  return `❓ <b>${esc(sourceName(source))}</b>\n${esc(truncate(question))}`;
}

export function formatAnswer(answer) {
  if (!answer) return "<b>→ ⏱ 응답 없음</b>";
  return `<b>→ ${esc(truncate(answer.value, 300))}</b>`;
}
