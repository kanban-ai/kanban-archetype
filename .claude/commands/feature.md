---
description: Crie feature do sistema seguindo as especificações técnicas
tags: [documentation, api-docs]
---

# Especificações técnicas

- Deve seguir as especificações técnicas "docs/content/tech/01-TECH.md"

# Migration

- Deve adicionar tudo na migration genesis "back/src/database/migrations/1728000000000-genesis.ts"

# Entidades

- Cada entidade deve ter um modulo para abrigar sua service e controller e DTOs
- Cada entidade deve estar na pasta do seu modulo
- Todas as entidades devem estender SuperEntity "back/src/common/entities/super.entity.ts"
- Toda entidade que é soft delete deve estender SoftDeletableEntity "back/src/common/entities/soft-deletable.entity.ts"

# Proposta de modelagem

- Deve seguir as especificações técnicas "docs/content/data/MODELO_POSTGRESQL.md"

# Tela de frontend

- Deve seguir as especificações técnicas "docs/content/tech/01-TECH.md"
- Deve criar a tela no arquivo "front/src/pages/views"
- Deve ser um menu no sidebar e estar sujeito a permissões, inserindo no arquivo "front/src/config/routes.config.tsx". Exemplo:
```typescript
// ============================================
  // GESTÃO DE CLIENTES
  // ============================================
  {
    id: 'customers-list',
    path: '/customers',
    component: CustomerListPage,
    title: 'Clientes',
    subtitle: 'Gerenciamento de clientes',
    module: 'customers',
    showInMenu: true,
    menuLabel: 'Clientes',
    menuIcon: Icons.Users,
    menuOrder: 2,
  },
  {
    id: 'customers-create',
    path: '/customers/new',
    component: CustomerCreatePage,
    title: 'Novo Cliente',
    subtitle: 'Cadastre um novo cliente no sistema',
    module: 'customers',
    showInMenu: false, // Não aparece no menu, mas é uma rota válida
  },

```
- Nunca deve usar alert, confirm. Sempre usar o componente ConfirmModal "front/src/components/common/ConfirmModal.tsx".
- Componentes genericos como buttons, inputs, modals, etc. devem estar no arquivo "front/src/components/common"
- Componentes específicos como CustomerFiltersForm, CustomerForm, ServiceForm, etc. devem estar na pasta da pagina exemplo "front/src/pages/customers/CustomerFiltersForm.tsx"
- As tela de front devem usar a barra de ações "front/src/components/common/ActionButtonBar.tsx" para controle de ações. Exemplo:
```typescript
const actionButtons: ActionButton[] = [
    {
      id: 'new',
      label: 'Novo', 
      variant: 'primary',
      icon: '📋',
      onClick: () => navigate('/customers/new'),
    },
    { // O save deve permanecer na mesma tela após salvar
      id: 'save',
      label: 'Salvar',
      variant: 'secondary',
      icon: '💾',
      onClick: () => alert('Funcionalidade Salvar em desenvolvimento'),
      disabled: true,
    },
    {
      id: 'edit',
      label: 'Editar',
      variant: 'secondary',
      icon: '📝',
      onClick: () => alert('Selecione um cliente para editar'),
      disabled: true,
    },
    {
      id: 'query',
      label: 'Consultar',
      variant: 'secondary',
      icon: '🔍',
      onClick: () => alert('Funcionalidade Consultar em desenvolvimento'),
      disabled: true,
    },
    {
      id: 'exclude',
      label: 'Excluir',
      variant: 'danger',
      icon: '🗑️',
      onClick: () => alert('Selecione um cliente para excluir'),
      disabled: true,
    },
    {
      id: 'cancel',
      label: 'Cancelar',
      variant: 'secondary',
      icon: '❌',
      onClick: () => navigate('/'),
    },
    {
      id: 'back',
      label: 'Voltar',
      variant: 'info',
      icon: '↩️',
      onClick: () => navigate(-1),
    },
  ];
  - Cada tela que for executada deve setar o titulo e subtitulo da pagina no arquivo "front/src/contexts/PageInfoContext.tsx". Exemplo:
  ```typescript

  const { setPageInfo } = usePageInfo();

  useEffect(() => {
    setPageInfo({
      title: 'Novo Cliente',
      subtitle: 'Cadastre um novo cliente no sistema',
    });
  }, [setPageInfo]);

  ```

# API

- Todas as APIs de litagem (array) deve ter paginação, deve receber o page e o page_size e retornar o total de registros e os registros paginados.
- Toda a api que for criada deve usar o curl na linha de comando para testar se as chamadas estao ok, testando o fluxo.
- Deve usar o psql para se conectar ao banco de dados e certificar se as ações na API estão coerentes.
- As credenciais do banco de dados estao no arquivo ".env"
