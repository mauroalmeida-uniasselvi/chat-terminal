import { afterEach, beforeEach, expect, jest } from "@jest/globals";
import { defineFeature, loadFeature } from "jest-cucumber";
import { fileURLToPath } from "node:url";

import { handler } from "../handler/index.js";
import { getLogLines, mockFetchJson, setupConsoleSpies } from "./test-support.js";

const feature = loadFeature(
  fileURLToPath(new URL("./exibicao-resultados.feature", import.meta.url))
);

defineFeature(feature, (test) => {
  let logSpy;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key-for-bdd";
    ({ logSpy } = setupConsoleSpies());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  test("Consulta retorna resultados validos", ({ given, when, then, and }) => {
    given("que existe ao menos um resultado valido para o termo pesquisado", () => {
      mockFetchJson({
        choices: [
          {
            message: {
              content: JSON.stringify({
                RelatedTopics: [
                  {
                    Topics: [
                      { Text: "Topic A", FirstURL: "https://example.com/a" },
                      { Text: "Topic B", FirstURL: "https://example.com/b" },
                    ],
                  },
                  { Text: "Topic C", FirstURL: "https://example.com/c" },
                ],
              }),
            },
          },
        ],
      });
    });

    when("o usuario executar a consulta com um termo valido", async () => {
      await handler(["node", "test"]);
    });

    then("o sistema deve exibir os resultados no terminal", () => {
      expect(getLogLines(logSpy)).toEqual([
        "Você: node test",
        "GPT: encontrei os seguintes resultados para você:",
        "- Topic A",
        "- Topic B",
        "- Topic C",
      ]);
    });

    and("cada resultado deve apresentar descricao", () => {
      for (const title of ["- Topic A", "- Topic B", "- Topic C"]) {
        expect(logSpy).toHaveBeenCalledWith(title);
      }
    });
  });

  test("Consulta sem resultados validos", ({ given, when, then }) => {
    given("que a consulta nao retorna resultados validos", () => {
      mockFetchJson({
        choices: [
          {
            message: {
              content: JSON.stringify({
                RelatedTopics: [
                  { FirstURL: "https://example.com/sem-texto" },
                ],
              }),
            },
          },
        ],
      });
    });

    when("o usuario executar a consulta com um termo valido", async () => {
      await handler(["qualquer", "termo"]);
    });

    then(
      /^o sistema deve exibir a mensagem "(.*)"$/,
      (expectedMessage) => {
        const lines = getLogLines(logSpy);
        expect(lines[lines.length - 1]).toBe(expectedMessage);
      }
    );
  });
});
