import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/api";
const MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";

export async function generateNewsSummary(news) {
  const prompt = `
Tu es un assistant de veille informatique.
Tu dois répondre uniquement en JSON valide.

Objectif :
Analyser cette actualité et renvoyer :
- summary : résumé court en français (2 phrases max)
- importanceReason : une phrase expliquant pourquoi cette news est importante pour une veille informatique étudiante

Contraintes :
- style clair
- pas de blabla
- pas d'invention
- se baser uniquement sur le contenu fourni

NEWS
Titre: ${news.title}
Source: ${news.source}
Catégorie: ${news.category}
Contenu: ${news.content}

Format attendu :
{
  "summary": "...",
  "importanceReason": "..."
}
`;

  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur Ollama: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.message?.content || "{}";

  try {
    return JSON.parse(content);
  } catch {
    return {
      summary: "Résumé indisponible.",
      importanceReason: "Importance non déterminée automatiquement."
    };
  }
}