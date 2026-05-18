# Requisitos Funcionais Do Projeto

## Escopo

Aplicação de linha de comando (CLI) para consulta de palavras-chave via ChatGPT e exibição de respostas em formato de chat para o usuário.

## Requisitos Funcionais

### RF01 - Informar termo de pesquisa

O usuario deve poder informar um termo de pesquisa pela linha de comando para realizar a consulta.

### RF02 - Exigir termo obrigatorio

O sistema deve impedir a consulta quando nenhum termo valido for informado e apresentar mensagem orientando o usuario a informar um termo de pesquisa.

### RF03 - Realizar consulta e retornar resultados

Ao receber um termo valido, o sistema deve enviar a consulta ao ChatGPT e retornar os resultados relacionados ao termo pesquisado.

### RF04 - Exibir resultados encontrados

O sistema deve exibir no terminal a conversa de chat entre o usuário e o assistente, listando os resultados relevantes para o termo pesquisado.

### RF05 - Informar ausencia de resultados

Quando nao houver resultados validos para o termo pesquisado, o sistema deve informar claramente que nenhum resultado foi encontrado.

### RF06 - Informar falha de consulta

Quando ocorrer erro durante a consulta, o sistema deve informar o problema ao usuario com mensagem de erro compreensivel.

## Roteiro De Teste BDD

Formato adotado: `Dado` / `Quando` / `Entao`.

### Funcionalidade: Consulta de termos na CLI

Cobre os requisitos RF01, RF02 e RF03.

#### Cenario: Usuario informa termo de pesquisa valido

- **Dado** que o usuario esta no terminal do projeto
- **E** que a aplicacao esta disponivel para execucao
- **Quando** executar o comando `npm start "cafe com leite"`
- **Entao** o sistema deve receber o termo de pesquisa informado
- **E** deve enviar a consulta ao ChatGPT com esse termo

#### Cenario: Usuario nao informa termo de pesquisa

- **Dado** que o usuario esta no terminal do projeto
- **Quando** executar o comando `npm run search -- "   "`
- **Entao** o sistema nao deve realizar consulta
- **E** deve exibir mensagem orientando a informar um termo de pesquisa

### Funcionalidade: Exibicao dos resultados

Cobre os requisitos RF04 e RF05.

#### Cenario: Consulta retorna resultados validos

- **Dado** que existe ao menos um resultado valido para o termo pesquisado
- **Quando** o usuario executar a consulta com um termo valido
- **Entao** o sistema deve exibir a conversa de chat no terminal
- **E** cada resultado deve apresentar descricao

#### Cenario: Consulta sem resultados validos

- **Dado** que a consulta nao retorna resultados validos
- **Quando** o usuario executar a consulta com um termo valido
- **Entao** o sistema deve exibir a mensagem `nenhum resultado encontrado`

### Funcionalidade: Tratamento de falhas

Cobre o requisito RF06.

#### Cenario: Ocorre erro durante a consulta

- **Dado** que existe uma falha na consulta ao ChatGPT
- **Quando** o usuario executar a pesquisa
- **Entao** o sistema deve informar que ocorreu erro na consulta
- **E** deve apresentar mensagem de erro compreensivel para o usuario

## Criterios De Aceite Do Roteiro

- Todos os cenarios devem executar sem ambiguidade de passos.
- Cada cenario deve validar exatamente o comportamento esperado do requisito correspondente.
- O resultado observado no terminal deve ser suficiente para aprovar ou reprovar o cenario.
