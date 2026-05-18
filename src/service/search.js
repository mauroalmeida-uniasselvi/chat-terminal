import { readFile } from "node:fs/promises";
import { http } from "../utils/http.js";

const historyFilePath =
  process.env.CHAT_HISTORY_PATH ||
  new URL("../../.chat_history.json", import.meta.url);

async function loadConversationHistory() {
  try {
    const content = await readFile(historyFilePath, "utf8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.flatMap((entry) => {
      if (Array.isArray(entry?.messages)) {
        return entry.messages;
      }
      if (entry?.role && typeof entry.content === "string") {
        return [entry];
      }
      return [];
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function searchTerm(query) {
  const term = query.trim();
  if (!term) {
    throw new Error("informe um termo de pesquisa.");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY nao configurada. Configure a variavel de ambiente OPENAI_API_KEY.");
  }

  const url = "https://api.openai.com/v1/chat/completions";
  const previousMessages = await loadConversationHistory();
  const messages = [
    {
      role: "system",
      content: "Voce e um assistente de busca. Retorne os resultados como um JSON valido com a estrutura { RelatedTopics: [{ Text: string, FirstURL: string }, ...] }.",
    },
    ...previousMessages,
    {
      role: "user",
      content: `Forneça resultados de busca para: ${term}. Retorne apenas um JSON valido.`,
    },
  ];

  const body = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body,
  };

  const response = await http(url, options);

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Resposta invalida do ChatGPT: estrutura nao reconhecida.");
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON nao encontrado na resposta.");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    throw new Error(`Erro ao processar resposta do ChatGPT: ${error.message}`);
  }
}
