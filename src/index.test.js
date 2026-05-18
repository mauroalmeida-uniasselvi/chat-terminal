import { test, expect, jest } from "@jest/globals";

async function waitFor(predicate, attempts = 20) {
  for (let index = 0; index < attempts; index += 1) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setImmediate(resolve));
  }
}

test("src/index.js executa o handler com argv e trata erro sem quebrar", async () => {
  const originalArgv = process.argv;
  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  process.argv = ["node", "src/index.js"];

  try {
    const suffix = `?test=${Date.now()}-${Math.random()}`;
    await import(`./index.js${suffix}`);
    await waitFor(() => errorSpy.mock.calls.length > 0);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const message = errorSpy.mock.calls[0].map(String).join(" ");
    expect(message).toMatch(/erro ao consultar:/);
    expect(message).toMatch(/informe um termo de pesquisa\./);
  } finally {
    process.argv = originalArgv;
    errorSpy.mockRestore();
  }
});
