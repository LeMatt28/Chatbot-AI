import { truncateText } from "../utils/text.js";

// url ollama et modele
const OLLAMA_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "phi3";
const OLLAMA_SUMMARY_TIMEOUT_MS = Number(process.env.OLLAMA_SUMMARY_TIMEOUT_MS ?? 45000);
const OLLAMA_EXPLAIN_TIMEOUT_MS = Number(process.env.OLLAMA_EXPLAIN_TIMEOUT_MS ?? 20000);
const OLLAMA_FAST_RETRY_TIMEOUT_MS = Number(process.env.OLLAMA_FAST_RETRY_TIMEOUT_MS ?? 12000);


// resume article avec ollama
export async function summarizeArticle(article) {

  const prompt = `Tu es un assistant pour etudiants.
Titre : ${article.title}
Contenu : ${truncateText(article.summary, 280)}

Donne un json :
{"summary": "resume en 2 phrases", "explain": "explication simple"}`;

  try {
    const json = await generateJson(prompt, {
      timeoutMs: OLLAMA_SUMMARY_TIMEOUT_MS,
      temperature: 0.3,
      numPredict: 140
    });

    return {
      summary: json.summary ?? article.summary,
      explain: json.explain ?? null,
      timedOut: false
    };

  } catch (err) {
    if (isTimeoutLikeError(err)) {
      try {
        const fastPrompt = `Resume en une phrase claire, format json strict.\nTitre: ${article.title}\nContenu: ${truncateText(article.summary, 180)}\n{"summary":"...","explain":null}`;
        const retryJson = await generateJson(fastPrompt, {
          timeoutMs: OLLAMA_FAST_RETRY_TIMEOUT_MS,
          temperature: 0.2,
          numPredict: 90
        });

        return {
          summary: retryJson.summary ?? article.summary,
          explain: retryJson.explain ?? null,
          timedOut: false
        };
      } catch (retryErr) {
        console.log("summarize retry error", retryErr.message);
        return {
          summary: article.summary,
          explain: null,
          timedOut: true
        };
      }
    }

    console.log("summarize error", err.message);

    return {
      summary: article.summary,
      explain: null,
      timedOut: false
    };
  }
}


// explication terme
export async function explainTerm(term) {

  const prompt = `Explique simplement : "${term}"
Reponds en json : {"explanation": "..."}`;

  try {
    const json = await generateJson(prompt, {
      timeoutMs: OLLAMA_EXPLAIN_TIMEOUT_MS,
      temperature: 0.4,
      numPredict: 120
    });

    return json.explanation;

  } catch (err) {
    console.log("explain error", err.message);
    return null;
  }
}


// check ollama dispo
export async function isOllamaAvailable() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000)
    });

    return res.ok;
  } catch {
    return false;
  }
}


async function generateJson(prompt, { timeoutMs, temperature, numPredict }) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature,
        num_predict: numPredict
      }
    }),
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!res.ok) {
    throw new Error("http " + res.status);
  }

  const data = await res.json();
  return parseOllamaJson(data.response);
}


function isTimeoutLikeError(err) {
  const message = String(err?.message ?? "").toLowerCase();
  return (
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("etimedout") ||
    message.includes("aborted")
  );
}


function parseOllamaJson(rawResponse) {
  const raw = String(rawResponse ?? "").trim();
  const noFence = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(noFence);
  } catch {
    const start = noFence.indexOf("{");
    const end = noFence.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(noFence.slice(start, end + 1));
    }

    throw new Error("invalid json from ollama");
  }
}