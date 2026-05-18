import { jest } from "@jest/globals";

export function setupConsoleSpies() {
  const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  return { logSpy, errorSpy };
}

export function mockFetchJson(payload, onUrl) {
  global.fetch = jest.fn(async (url, options = {}) => {
    if (typeof onUrl === "function") {
      if (options.method === "POST") {
        try {
          const body = JSON.parse(options.body || "{}");
          const userMessage =
            body.messages?.filter((m) => m.role === "user").pop()?.content || "";
          onUrl(userMessage);
        } catch (e) {
          // Ignore parsing errors in test setup
        }
      } else {
        onUrl(url);
      }
    }

    const responsePayload =
      options.method === "POST"
        ? payload?.choices
          ? payload
          : { choices: [{ message: { content: JSON.stringify(payload) } }] }
        : payload;

    return {
      ok: true,
      json: async () => responsePayload,
    };
  });
}

export function mockFetchHttpError(status = 500) {
  global.fetch = jest.fn(async () => ({
    ok: false,
    status,
    json: async () => ({}),
  }));
}

export function getLogLines(logSpy) {
  return logSpy.mock.calls.map((args) => args.join(" "));
}

export function getFirstErrorMessage(errorSpy) {
  const firstCall = errorSpy.mock.calls[0] ?? [];
  return firstCall.map(String).join(" ");
}
