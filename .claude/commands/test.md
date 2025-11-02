---
description: Gerador de teste com cypress (E2E)
tags: [test, cypress, e2e]
---

# Regras

- Deve criar o teste com cypress (E2E)
- Para ancorar o seletor nos elementos, crie no front data-cy no frontend para selecionar melhor o elemento
- Nunca altere nada no frontend e nem no backend, apenas deve alterar o front para adicionar o data-cy e alterar o backend para adicionar o data-cy no retorno da API.
- Todo arquivo de teste deve inicioar com a base "zerada",então deve ter um before (executa uma vez para o describe) , entao deve executar antes de cada arquivo de teste o comando `pnpm run db:drop` para garantir que o banco de dados esteja zerado.
- Em cada teste do arquivo, deve ter verificações no banco de dados diretamente para garantir que o teste passou, ou seja, deve ter um expect no final do teste para garantir que o que foi executado na tela, refletiu no banco de dados.
- Sempre execute o teste no final, para ver se está passando


!!! Importante !!!
- Deve priorizar teste de navegação de tela para tela, o uso de API ou queries no banco de dados deve ser apenas quando a ação não é o foco do teste.
- A prioridade de teste é:
  - Teste de navegação de tela para tela
  - Teste de API
  - Teste de query no banco de dados
  - Teste de validação no banco de dados


# Testes

Os testes deveme star sempre completos, sem gambiarra, deve ter coerência e cobertura completa.
Não deve comentar teste somente para passar, deve testar realmente as funcionalidades.
Deve cobrir os cenários de sucesso e de erro.
Sempre olhar os arquivos de frontend e backend para entender o que deve ser testado.
Nunca deixe .skip no teste, deve ser sempre executado e passar
Sempre olhe as imagem de screenshot para entender os erros