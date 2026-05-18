# language: pt
Funcionalidade: Tratamento de falhas
  Como usuario da aplicacao
  Quero receber mensagens claras de erro
  Para entender quando a consulta nao puder ser concluida

  Cenario: Ocorre erro durante a consulta
    Dado que existe uma falha na consulta da fonte de dados
    Quando o usuario executar a pesquisa
    Entao o sistema deve informar que ocorreu erro na consulta
    E deve apresentar mensagem de erro compreensivel para o usuario
