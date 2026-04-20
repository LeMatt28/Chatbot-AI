const OLLAMA_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "mistral";

// stockage en memoire
const conversations = new Map();

function getHistory(userId) {
  return conversations.get(userId) ?? [];
}

function saveHistory(userId, history) {
  conversations.set(userId, history.slice(-10));
}

export function clearHistory(userId) {
  conversations.delete(userId);
}

// prompt systeme
const SYSTEM_PROMPT = `
Tu es Chat-Actu, un assistant de veille technologique.
Tu aides des étudiants à comprendre l'actualité IT.

Règles :
- réponds en français
- uniquement sujets IT
- réponses courtes
- si hors sujet, refuse
`;

export async function chat(userId, userMessage) {
  const history = getHistory(userId);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage }
  ];

  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 300
        }
      }),
      signal: AbortSignal.timeout(90000)
    });

    if (!res.ok) {
      throw new Error("HTTP error " + res.status);
    }

    const data = await res.json();
    const reply = data.message?.content;

    if (!reply) {
      return null;
    }

    saveHistory(userId, [
      ...history,
      { role: "user", content: userMessage },
      { role: "assistant", content: reply }
    ]);

    return reply;

  } catch (err) {
    console.log("chat error", err.message);
    return null;
  }
}

export function getConversationLength(userId) {
  return getHistory(userId).length / 2;
}