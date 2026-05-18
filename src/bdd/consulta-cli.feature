# language: pt
Funcionalidade: Consulta de termos na CLI
  Como usuario da aplicacao
  Quero informar um termo de pesquisa
  Para consultar conteudos relacionados

  Cenario: Usuario informa termo de pesquisa valido
    Dado que o usuario esta no terminal do projeto
    E que a aplicacao esta disponivel para execucao
    Quando executar a busca com o termo "cafe com leite"
    Entao o sistema deve consultar a fonte de dados com esse termo
    E deve retornar resultados relacionados

  Cenario: Usuario nao informa termo de pesquisa
    Dado que o usuario esta no terminal do projeto
    Quando executar a busca sem termo valido
    Entao o sistema nao deve consultar a fonte de dados
    E deve exibir mensagem orientando a informar um termo de pesquisa
