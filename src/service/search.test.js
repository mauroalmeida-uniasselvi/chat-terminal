import { test, expect, afterEach, beforeEach, jest } from "@jest/globals";

const httpMock = jest.fn();
const readFileMock = jest.fn();

jest.unstable_mockModule("../utils/http.js", () => ({
  http: httpMock,
}));

jest.unstable_mockModule("node:fs/promises", () => ({
  readFile: readFileMock,
}));

const { searchTerm } = await import("./search.js");

beforeEach(() => {
  process.env.OPENAI_API_KEY = "test-api-key-123";
  readFileMock.mockReset();
  httpMock.mockReset();
  readFileMock.mockRejectedValue({ code: "ENOENT" });
});

afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.OPENAI_API_KEY;
});

test("searchTerm envia POST request para ChatGPT com termo apropriado", async () => {
  const chatgptResponse = {
    choices: [
      {
        message: {
          content: '{"RelatedTopics": [{"Text": "Cafe com leite", "FirstURL": "https://example.com/cafe"}]}',
        },
      },
    ],
  };
  httpMock.mockResolvedValue(chatgptResponse);

  const result = await searchTerm("  cafe com leite & pao  ");

  expect(result).toEqual({
    RelatedTopics: [
      { Text: "Cafe com leite", FirstURL: "https://example.com/cafe" },
    ],
  });
  expect(httpMock).toHaveBeenCalledWith(
    "https://api.openai.com/v1/chat/completions",
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
        "Authorization": "Bearer test-api-key-123",
      }),
    })
  );
});

test("searchTerm inclui o histórico completo da conversa nas mensagens", async () => {
  readFileMock.mockResolvedValue(
    JSON.stringify([
      {
        id: "2026-05-18T00:00:00.000Z",
        model: "gpt-3.5-turbo",
        createdAt: "2026-05-18T00:00:00.000Z",
        messages: [
          {
            role: "user",
            content: "primeira pergunta",
            createdAt: "2026-05-18T00:00:00.000Z",
          },
          {
            role: "assistant",
            content: "- resultado anterior",
            createdAt: "2026-05-18T00:00:00.000Z",
          },
        ],
      },
    ])
  );

  httpMock.mockResolvedValue({
    choices: [
      {
        message: {
          content: '{"RelatedTopics": [{"Text": "Cafe com leite", "FirstURL": "https://example.com/cafe"}]}',
        },
      },
    ],
  });

  await searchTerm("novo termo");

  const calledOptions = httpMock.mock.calls[0][1];
  const requestBody = JSON.parse(calledOptions.body);
  expect(requestBody.messages).toEqual([
    {
      role: "system",
      content: "Voce e um assistente de busca. Retorne os resultados como um JSON valido com a estrutura { RelatedTopics: [{ Text: string, FirstURL: string }, ...] }.",
    },
    {
      role: "user",
      content: "primeira pergunta",
      createdAt: "2026-05-18T00:00:00.000Z",
    },
    {
      role: "assistant",
      content: "- resultado anterior",
      createdAt: "2026-05-18T00:00:00.000Z",
    },
    {
      role: "user",
      content: "Forneça resultados de busca para: novo termo. Retorne apenas um JSON valido.",
    },
  ]);
});

test("searchTerm lança erro quando OPENAI_API_KEY nao esta configurada", async () => {
  delete process.env.OPENAI_API_KEY;

  await expect(searchTerm("cafe")).rejects.toThrow(
    /OPENAI_API_KEY nao configurada/
  );
  expect(httpMock).not.toHaveBeenCalled();
});

test("searchTerm lança erro quando termo for vazio", async () => {
  await expect(searchTerm("   ")).rejects.toThrow(/informe um termo de pesquisa\./);
  expect(httpMock).not.toHaveBeenCalled();
});

test("searchTerm lança erro quando resposta do ChatGPT tem estrutura invalida", async () => {
  httpMock.mockResolvedValue({ choices: [] });

  await expect(searchTerm("cafe")).rejects.toThrow(
    /estrutura nao reconhecida/
  );
});

test("searchTerm lança erro quando JSON na resposta do ChatGPT e invalido", async () => {
  httpMock.mockResolvedValue({
    choices: [
      {
        message: {
          content: "resposta sem json valido",
        },
      },
    ],
  });

  await expect(searchTerm("cafe")).rejects.toThrow(
    /JSON nao encontrado/
  );
});
