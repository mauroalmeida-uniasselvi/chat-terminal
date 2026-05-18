import { afterEach, beforeEach, expect, jest } from "@jest/globals";
import { defineFeature, loadFeature } from "jest-cucumber";
import { fileURLToPath } from "node:url";

import { handler } from "../handler/index.js";
import {
  getFirstErrorMessage,
  mockFetchHttpError,
  setupConsoleSpies,
} from "./test-support.js";

const feature = loadFeature(
  fileURLToPath(new URL("./tratamento-falhas.feature", import.meta.url))
);

defineFeature(feature, (test) => {
  let errorSpy;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key-for-bdd";
    ({ errorSpy } = setupConsoleSpies());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  test("Ocorre erro durante a consulta", ({ given, when, then, and }) => {
    given("que existe uma falha na consulta da fonte de dados", () => {
      mockFetchHttpError(503);
    });

    when("o usuario executar a pesquisa", async () => {
      await handler(["falha"]);
    });

    then("o sistema deve informar que ocorreu erro na consulta", () => {
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const message = getFirstErrorMessage(errorSpy);
      expect(message).toMatch(/erro ao consultar:/);
    });

    and(
      "deve apresentar mensagem de erro compreensivel para o usuario",
      () => {
        const message = getFirstErrorMessage(errorSpy);
        expect(message).toMatch(/falha na requisicao: HTTP 503/);
      }
    );
  });
});
