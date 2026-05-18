import { test, expect, beforeEach, afterEach, jest } from "@jest/globals";

const searchTermMock = jest.fn();
const readFileMock = jest.fn();
const writeFileMock = jest.fn();

jest.unstable_mockModule("../service/search.js", () => ({
  searchTerm: searchTermMock,
}));

jest.unstable_mockModule("node:fs/promises", () => ({
  readFile: readFileMock,
  writeFile: writeFileMock,
}));

const { handler } = await import("./index.js");

let logSpy;
let errorSpy;

beforeEach(() => {
  searchTermMock.mockReset();
  readFileMock.mockReset();
  writeFileMock.mockReset();
  readFileMock.mockRejectedValue({ code: "ENOENT" });
  writeFileMock.mockResolvedValue();
  logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("handler imprime resultados como chat e salva historico", async () => {
  searchTermMock.mockResolvedValue({
    RelatedTopics: [
      {
        Topics: [
          { Text: "Topic A", FirstURL: "https://example.com/a" },
          { Text: "Topic B", FirstURL: "https://example.com/b" },
        ],
      },
      { Text: "Topic C", FirstURL: "https://example.com/c" },
    ],
  });

  await handler(["node", "test"]);

  expect(logSpy.mock.calls.map((args) => args.join(" "))).toEqual([
    "Você: node test",
    "GPT: encontrei os seguintes resultados para você:",
    "- Topic A",
    "- Topic B",
    "- Topic C",
  ]);
  expect(writeFileMock).toHaveBeenCalledTimes(1);
  expect(writeFileMock.mock.calls[0][0].toString()).toContain(".chat_history.json");

  const savedContent = writeFileMock.mock.calls[0][1];
  const savedHistory = JSON.parse(savedContent);
  expect(savedHistory).toHaveLength(1);
  expect(savedHistory[0]).toMatchObject({
    id: expect.any(String),
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: "node test", createdAt: expect.any(String) },
      { role: "assistant", content: expect.any(String), createdAt: expect.any(String) },
    ],
  });
  expect(savedHistory[0].messages[1].content).toContain("- Topic A");
});

test("handler imprime resultados mesmo quando alguns topicos nao possuem url", async () => {
  searchTermMock.mockResolvedValue({
    RelatedTopics: [
      { Text: "sem url" },
      { FirstURL: "https://example.com/sem-texto" },
    ],
  });

  await handler(["qualquer", "termo"]);
  expect(logSpy.mock.calls.map((args) => args.join(" "))).toEqual([
    "Você: qualquer termo",
    "GPT: encontrei os seguintes resultados para você:",
    "- sem url",
  ]);
});

test("handler trata resposta sem RelatedTopics", async () => {
  searchTermMock.mockResolvedValue({});

  await handler(["sem", "estrutura"]);
  expect(logSpy.mock.calls.map((args) => args.join(" "))).toEqual([
    "Você: sem estrutura",
    "GPT: não encontrei resultados para a sua busca.",
    "nenhum resultado encontrado",
  ]);
});

test("handler registra erro quando busca falha", async () => {
  searchTermMock.mockRejectedValue(new Error("falha na requisicao: HTTP 500"));

  await handler(["falha"]);

  expect(errorSpy).toHaveBeenCalledTimes(1);
  expect(errorSpy.mock.calls[0].join(" ")).toMatch(/erro ao consultar:/);
  expect(errorSpy.mock.calls[0].join(" ")).toMatch(
    /falha na requisicao: HTTP 500/
  );
});
