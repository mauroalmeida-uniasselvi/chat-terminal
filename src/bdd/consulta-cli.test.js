import { afterEach, beforeEach, expect, jest } from "@jest/globals";
import { defineFeature, loadFeature } from "jest-cucumber";
import { fileURLToPath } from "node:url";

import { handler } from "../handler/index.js";
import {
  getFirstErrorMessage,
  mockFetchJson,
  setupConsoleSpies,
} from "./test-support.js";

const feature = loadFeature(
  fileURLToPath(new URL("./consulta-cli.feature", import.meta.url))
);

defineFeature(feature, (test) => {
  let logSpy;
  let errorSpy;
  let receivedTerm;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key-for-bdd";
    receivedTerm = "";
    ({ logSpy, errorSpy } = setupConsoleSpies());
    mockFetchJson(
      {
        choices: [
          {
            message: {
              content: '{"RelatedTopics": [{"Text": "Topic A", "FirstURL": "https://example.com/a"}]}',
            },
          },
        ],
      },
      (message) => {
        // Extract the search term from the ChatGPT message
        // Message format: "Forneça resultados de busca para: {term}. Retorne apenas um JSON valido."
        const match = message.match(/Forneça resultados de busca para: (.+?)\./);
        receivedTerm = match ? match[1] : "";
      }
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  test("Usuario informa termo de pesquisa valido", ({ given, and, when, then }) => {
    given("que o usuario esta no terminal do projeto", () => {});

    and("que a aplicacao esta disponivel para execucao", () => {});

    when(/^executar a busca com o termo "(.*)"$/, async (term) => {
      await handler(term.split(" "));
    });

    then("o sistema deve consultar a fonte de dados com esse termo", () => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(receivedTerm).toBe("cafe com leite");
    });

    and("deve retornar resultados relacionados", () => {
      expect(logSpy).toHaveBeenCalledWith("- Topic A");
    });
  });

  test("Usuario nao informa termo de pesquisa", ({ given, when, then, and }) => {
    given("que o usuario esta no terminal do projeto", () => {});

    when("executar a busca sem termo valido", async () => {
      await handler(["   "]);
    });

    then("o sistema nao deve consultar a fonte de dados", () => {
      expect(global.fetch).not.toHaveBeenCalled();
    });

    and(
      "deve exibir mensagem orientando a informar um termo de pesquisa",
      () => {
        expect(errorSpy).toHaveBeenCalledTimes(1);
        const message = getFirstErrorMessage(errorSpy);
        expect(message).toMatch(/informe um termo de pesquisa\./);
      }
    );
  });
});
