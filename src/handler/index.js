import { writeFile, readFile } from "node:fs/promises";
import { searchTerm } from "../service/search.js";

const historyFilePath =
  process.env.CHAT_HISTORY_PATH ||
  new URL("../../.chat_history.json", import.meta.url);

function normalizeTopic(topic) {
  const sourceTitle = topic.Text ?? topic.Title ?? topic.title;

  return {
    title: sourceTitle ?? "Resultado",
    hasText: typeof sourceTitle === "string" && sourceTitle.length > 0,
    description: topic.Description ?? topic.description ?? "",
    url: topic.FirstURL ?? topic.URL ?? topic.url ?? "",
  };
}

export function buildResultLines(results) {
  const relatedTopics = Array.isArray(results?.RelatedTopics)
    ? results.RelatedTopics
    : [];

  const topics = relatedTopics
    .flatMap((item) => {
      if (Array.isArray(item?.Topics)) {
        return item.Topics;
      }
      return [item];
    })
    .map(normalizeTopic)
    .filter((item) => item.hasText);

  if (!topics.length) {
    return ["nenhum resultado encontrado"];
  }

  return topics.map((topic) => {
    if (topic.description) {
      return `- ${topic.title}: ${topic.description}`;
    }
    return `- ${topic.title}`;
  });
}

export function printChatResult(results, query) {
  const lines = buildResultLines(results);
  const responseHeader = lines[0] === "nenhum resultado encontrado"
    ? "GPT: não encontrei resultados para a sua busca."
    : "GPT: encontrei os seguintes resultados para você:";

  console.log(`Você: ${query}`);
  console.log(responseHeader);
  for (const line of lines) {
    console.log(line);
  }
}

async function loadHistory() {
  try {
    const content = await readFile(historyFilePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function saveHistory(history) {
  await writeFile(historyFilePath, JSON.stringify(history, null, 2), "utf8");
}

export async function appendChatHistory(query, answerLines) {
  const history = await loadHistory();
  const timestamp = new Date().toISOString();

  const chatEntry = {
    id: timestamp,
    model: "gpt-3.5-turbo",
    createdAt: timestamp,
    messages: [
      {
        role: "user",
        content: query,
        createdAt: timestamp,
      },
      {
        role: "assistant",
        content: answerLines,
        createdAt: timestamp,
      },
    ],
  };

  history.push(chatEntry);
  await saveHistory(history);
}

export async function handler(args) {
  const query = args.join(" ");

  try {
    const results = await searchTerm(query.trim());
    const lines = buildResultLines(results);
    printChatResult(results, query);
    await appendChatHistory(query, lines.join("\n"));
  } catch (error) {
    console.error("erro ao consultar:", error.message);
  }
}
