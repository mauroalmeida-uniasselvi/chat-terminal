export async function http(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`falha na requisicao: HTTP ${response.status}`);
  }

  try {
    return await response.json();
  } catch (_error) {
    throw new Error("Resposta invalida: JSON malformado.");
  }
}
