# chat-terminal
Uma aplicação por linha de comando que executar chamada CHATGPT

# Fundamentos De Testes De Código

Este documento apresenta fundamentos de testes de software, com foco em **teste unitário**.

Jest é utilizado como ferramenta de execução, mas o foco principal está nos princípios que se aplicam a qualquer stack.

## Setup - Integração com ChatGPT

Esta aplicação utiliza a **OpenAI Chat Completions API** para realizar buscas em formato de chat. A cada nova pergunta, o histórico completo da conversa é enviado para o ChatGPT e o resultado é exibido no terminal como uma conversa entre o usuário e o assistente.

Para executar a aplicação (não os testes), você precisa configurar sua chave de API:

1. Obtenha sua chave de API em: https://platform.openai.com/account/api-keys
2. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edite `.env` e adicione sua chave e o caminho do histórico, se desejar:
   ```
   OPENAI_API_KEY=sua_chave_aqui
   CHAT_HISTORY_PATH=.chat_history.json
   ```

### Execução

- **Testes**: `npm test` (mocks de API, sem necessidade de chave real)
- **Aplicação**:
  ```bash
  npm start "seu termo de busca"
  ```
  Exemplo: `npm start "inteligencia artificial"`

## Objetivo

Objetivos deste guia:

- identificar o que é unidade de teste
- entender o que é teste BDD e seus fundamentos
- separar regra de negócio de dependência externa
- escrever testes claros para casos de sucesso e erro
- entender quando usar mock, spy e asserção
- interpretar cobertura sem confundir métrica com qualidade

### Teste Unitário

Valida uma única unidade de comportamento, com dependências externas isoladas.

- Rápido
- Determinístico
- Fácil de debugar

Exemplo no projeto:

- `src/service/search.test.js` testa `searchTerm` isolando a camada HTTP

### O que é uma unidade?

Unidade é a menor parte com responsabilidade clara.

No projeto:

- `searchTerm` monta URL, valida entrada e delega requisição
- `http` traduz resposta HTTP para JSON e trata erro

### Regra Principal

Teste unitário valida o comportamento da unidade, e não o comportamento de internet, API real, banco de dados ou filesystem.

### Estrutura recomendada (AAA)

- Arrange: preparar dados e mocks
- Act: executar a unidade
- Assert: validar resultado

Exemplo conceitual:

```js
test("deve enviar POST request para ChatGPT com termo apropriado", async () => {
  // Arrange
  const chatgptResponse = {
    choices: [
      {
        message: {
          content: '{"RelatedTopics": [{"Text": "Cafe com leite", "FirstURL": "https://example.com"}]}'
        }
      }
    ]
  };
  httpMock.mockResolvedValue(chatgptResponse);

  // Act
  const result = await searchTerm("cafe com leite");

  // Assert
  expect(result).toEqual({
    RelatedTopics: [{ Text: "Cafe com leite", FirstURL: "https://example.com" }]
  });
  expect(httpMock).toHaveBeenCalledWith(
    "https://api.openai.com/v1/chat/completions",
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "Authorization": "Bearer test-api-key-123"
      })
    })
  );
});
```

### Teste BDD

BDD (Behavior-Driven Development) é uma abordagem de desenvolvimento guiada por comportamento.
O foco é descrever como o sistema deve se comportar do ponto de vista do usuário e do negócio.

Em vez de iniciar por detalhes técnicos, o BDD começa por exemplos concretos de comportamento,
normalmente escritos em linguagem próxima do natural.

Fundamentos principais:

- comportamento antes da implementação
- linguagem compartilhada entre negócio e time técnico
- cenário orientado a exemplo
- critérios de aceitação explícitos

Formato comum de cenário (Given-When-Then):

- Given (Dado): contexto inicial
- When (Quando): ação executada
- Then (Então): resultado esperado

Exemplo conceitual em Gherkin:

```gherkin
Funcionalidade: Consulta de termo

  Cenário: Consulta com termo válido
    Dado que o usuário informa "golang"
    Quando ele executa a consulta
    Então o sistema retorna resultados relacionados
```

No projeto, os cenários BDD estão em `src/bdd/*.feature`, e os passos de execução em
`src/bdd/*.test.js`.

## Assert, Mock E Spy

### Assert

É a verificação final. Sem assert, não existe teste de fato.

### Mock

Substitui dependência externa para manter o teste isolado.

Quando usar:

- chamada HTTP
- acesso a banco
- leitura/escrita de arquivo

### Spy

Observa chamadas de uma função real (quantas vezes, com quais argumentos).

Quando usar:

- validar logs
- validar callback
- validar efeitos colaterais

## Boas Práticas

- Nome de teste deve descrever comportamento
- Um comportamento por teste
- Cobrir caminho feliz e caminho de erro
- Evitar dependências reais de rede no unitário
- Evitar testes acoplados a detalhes internos

## Erros Comuns Em Teste Unitário

- testar implementação em vez de comportamento
- mockar tudo sem necessidade
- manter testes longos e pouco legíveis
- depender de tempo real, rede real ou ordem de execução

## Cobertura

Cobertura mede execução de código, não qualidade total.

- `statements`: instruções executadas
- `functions`: funções chamadas
- `branches`: caminhos lógicos exercitados (`if/else`, `try/catch`)
- `lines`: linhas executadas

Mensagem central:

- 100% de cobertura é um excelente sinal de disciplina
- 100% de cobertura não garante ausência de bugs
- boa cobertura + bons cenários = maior confiança no software

## Comandos Do Projeto

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Arquivos De Teste Atuais

- `src/index.test.js`
- `src/handler/index.test.js`
- `src/service/search.test.js`
- `src/utils/http.test.js`

## Roteiro Rápido

1. Mostrar a unidade `searchTerm` e sua responsabilidade
2. Escrever teste de sucesso com mock de HTTP
3. Escrever teste de erro para entrada inválida
4. Mostrar um teste de integração no handler
5. Rodar cobertura e discutir `branches`

## Observação Final

Este documento deve ser lido como referência técnica para este projeto.
Durante a implementação dos testes, priorize clareza, isolamento de comportamento e consistência.
