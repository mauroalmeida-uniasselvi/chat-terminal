# language: pt
Funcionalidade: Exibicao de resultados
  Como usuario da aplicacao
  Quero visualizar o resultado da consulta
  Para acessar descricao e link dos topicos encontrados

  Cenario: Consulta retorna resultados validos
    Dado que existe ao menos um resultado valido para o termo pesquisado
    Quando o usuario executar a consulta com um termo valido
    Entao o sistema deve exibir os resultados no terminal
    E cada resultado deve apresentar descricao

  Cenario: Consulta sem resultados validos
    Dado que a consulta nao retorna resultados validos
    Quando o usuario executar a consulta com um termo valido
    Entao o sistema deve exibir a mensagem "nenhum resultado encontrado"
