import { test, expect, afterEach, jest } from "@jest/globals";

import { http } from "./http.js";

afterEach(() => {
  jest.restoreAllMocks();
});

test("http retorna JSON para GET request com options", async () => {
  const expected = { ok: true, value: 123 };

  global.fetch = jest.fn(async (url, options) => {
    expect(url).toBe("https://example.com/api");
    expect(options).toEqual({ method: "GET" });
    return {
      ok: true,
      json: async () => expected,
    };
  });

  const result = await http("https://example.com/api", { method: "GET" });
  expect(result).toEqual(expected);
});

test("http retorna JSON para POST request com body e headers", async () => {
  const expected = { choices: [{ message: { content: "response" } }] };
  const body = JSON.stringify({ model: "gpt-3.5-turbo", messages: [] });

  global.fetch = jest.fn(async (url, options) => {
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(options).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "Authorization": "Bearer test-key",
        }),
        body,
      })
    );
    return {
      ok: true,
      json: async () => expected,
    };
  });

  const result = await http("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer test-key",
    },
    body,
  });
  expect(result).toEqual(expected);
});

test("http lança erro quando status HTTP nao for ok", async () => {
  global.fetch = jest.fn(async () => ({
    ok: false,
    status: 503,
    json: async () => ({})
  }));

  await expect(http("https://example.com/unavailable")).rejects.toThrow(
    /falha na requisicao: HTTP 503/
  );
});

test("http lança erro para JSON malformado", async () => {
  global.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => {
      throw new Error("broken");
    },
  }));

  await expect(http("https://example.com/invalid-json")).rejects.toThrow(
    /Resposta invalida: JSON malformado\./
  );
});
