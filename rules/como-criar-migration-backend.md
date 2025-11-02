# Como criar uma Migration no Backend?

> Guia completo para criar e gerenciar migrations com TypeORM no projeto.

## O que são Migrations?

Migrations são arquivos de controle de versão do banco de dados. Elas permitem:
- Versionar alterações no schema do banco
- Manter histórico de mudanças
- Sincronizar banco entre ambientes (dev, staging, prod)
- Reverter alterações quando necessário

## Comandos Disponíveis

### Criar Migration Vazia

```bash
npm run typeorm -- migration:create src/database/migrations/NomeDaMigration
```

Cria um arquivo vazio para você implementar manualmente.

### Gerar Migration Automática

```bash
npm run typeorm -- migration:generate src/database/migrations/NomeDaMigration
```

Gera automaticamente baseado nas diferenças entre entities e banco de dados.

### Executar Migrations

```bash
npm run typeorm -- migration:run
```

Executa todas as migrations pendentes em ordem cronológica.

### Reverter Última Migration

```bash
npm run typeorm -- migration:revert
```

Reverte a última migration executada (chama o método `down`).

### Listar Migrations

```bash
npm run typeorm -- migration:show
```

Mostra quais migrations foram executadas e quais estão pendentes.

## Passo a Passo: Criar Migration Manual

### 1. Criar o arquivo

```bash
npm run typeorm -- migration:create src/database/migrations/CreateProductsTable
```

Isso gera:
```
src/database/migrations/1234567890000-CreateProductsTable.ts
```

> O timestamp no início garante ordem de execução.

### 2. Implementar método `up`

O método `up` define o que será executado ao rodar a migration:

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProductsTable1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'stock',
            type: 'int',
            default: 0,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true, // ifNotExists
    );

    // Adicionar foreign key
    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter a migration (dropar tabela)
    await queryRunner.dropTable('products');
  }
}
```

### 3. Executar a migration

```bash
npm run typeorm -- migration:run
```

## Tipos de Migrations

### 1. Criar Tabela

```typescript
await queryRunner.createTable(
  new Table({
    name: 'nome_da_tabela',
    columns: [
      { name: 'id', type: 'int', isPrimary: true, isGenerated: true },
      { name: 'campo', type: 'varchar', length: '255' },
    ],
  }),
);
```

### 2. Adicionar Coluna

```typescript
await queryRunner.addColumn(
  'nome_da_tabela',
  new TableColumn({
    name: 'nova_coluna',
    type: 'varchar',
    length: '255',
    isNullable: true,
  }),
);
```

### 3. Remover Coluna

```typescript
await queryRunner.dropColumn('nome_da_tabela', 'nome_da_coluna');
```

### 4. Modificar Coluna

```typescript
await queryRunner.changeColumn(
  'nome_da_tabela',
  'nome_coluna_antiga',
  new TableColumn({
    name: 'nome_coluna_nova',
    type: 'varchar',
    length: '500',
  }),
);
```

### 5. Criar Índice

```typescript
await queryRunner.createIndex(
  'nome_da_tabela',
  new TableIndex({
    name: 'IDX_NOME_CAMPO',
    columnNames: ['campo'],
  }),
);
```

### 6. Criar Índice Composto

```typescript
await queryRunner.createIndex(
  'nome_da_tabela',
  new TableIndex({
    name: 'IDX_CAMPO1_CAMPO2',
    columnNames: ['campo1', 'campo2'],
  }),
);
```

### 7. Adicionar Foreign Key

```typescript
await queryRunner.createForeignKey(
  'tabela_filha',
  new TableForeignKey({
    columnNames: ['coluna_fk'],
    referencedColumnNames: ['id'],
    referencedTableName: 'tabela_pai',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  }),
);
```

### 8. Executar SQL Raw

```typescript
await queryRunner.query(`
  UPDATE users
  SET active = true
  WHERE created_at > '2024-01-01'
`);
```

### 9. Inserir Dados (Seed)

```typescript
await queryRunner.query(`
  INSERT INTO sectors (name, description)
  VALUES
    ('Tecnologia', 'Setor de tecnologia'),
    ('Financeiro', 'Setor financeiro'),
    ('Saúde', 'Setor de saúde')
`);
```

## Exemplo Completo: Adicionar Campo

### Migration: Adicionar campo `active` na tabela `products`

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddActiveToProducts1234567890001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'active',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'active');
  }
}
```

## Exemplo Completo: Adicionar Relacionamento

### Migration: Adicionar relacionamento `category_id` em `products`

```typescript
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddCategoryToProducts1234567890002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'category_id',
        type: 'int',
        isNullable: true,
      }),
    );

    // Adicionar foreign key
    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign key primeiro
    const table = await queryRunner.getTable('products');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('category_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('products', foreignKey);
    }

    // Remover coluna
    await queryRunner.dropColumn('products', 'category_id');
  }
}
```

## Migrations Automáticas (Generate)

### Quando usar

Use `migration:generate` quando:
- Você alterou entities existentes
- Quer sincronizar entities com o banco
- Prefere que o TypeORM gere o SQL

### Como funciona

1. **Altere suas entities**:

```typescript
@Entity('products')
export class Product extends SuperEntity {
  @Column()
  name: string;

  // Nova coluna adicionada
  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;
}
```

2. **Gere a migration**:

```bash
npm run typeorm -- migration:generate src/database/migrations/AddBrandToProducts
```

3. **TypeORM detecta as diferenças** e gera automaticamente:

```typescript
export class AddBrandToProducts1234567890003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD "brand" character varying(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN "brand"
    `);
  }
}
```

4. **Execute a migration**:

```bash
npm run typeorm -- migration:run
```

## Boas Práticas

### 1. Sempre implemente `down()`

Permita reverter a migration se necessário:

```typescript
public async down(queryRunner: QueryRunner): Promise<void> {
  // Reverter exatamente o que foi feito em up()
  await queryRunner.dropTable('nome_tabela');
}
```

### 2. Use transações

As migrations já rodam em transação por padrão. Se falhar, tudo é revertido.

### 3. Teste em desenvolvimento primeiro

```bash
# Executar
npm run typeorm -- migration:run

# Reverter se houver problema
npm run typeorm -- migration:revert

# Corrigir a migration
# Executar novamente
npm run typeorm -- migration:run
```

### 4. Nomeie adequadamente

Use nomes descritivos:
-  `CreateProductsTable`
-  `AddActiveToUsers`
-  `CreateIndexOnQuotesDate`
- L `Migration1`
- L `UpdateTable`

### 5. Uma responsabilidade por migration

Não misture múltiplas alterações não relacionadas:

L **Ruim**:
```typescript
// CreateProductsAndCategoriesAndOrders.ts
// Cria 3 tabelas diferentes em uma migration
```

 **Bom**:
```typescript
// CreateProductsTable.ts
// CreateCategoriesTable.ts
// CreateOrdersTable.ts
```

### 6. Cuidado com dados existentes

Se adicionar coluna NOT NULL em tabela com dados:

```typescript
// Adicionar com default ou nullable primeiro
await queryRunner.addColumn(
  'products',
  new TableColumn({
    name: 'category_id',
    type: 'int',
    isNullable: true, // Permitir null inicialmente
  }),
);

// Preencher dados
await queryRunner.query(`
  UPDATE products
  SET category_id = 1
  WHERE category_id IS NULL
`);

// Depois tornar NOT NULL
await queryRunner.changeColumn(
  'products',
  'category_id',
  new TableColumn({
    name: 'category_id',
    type: 'int',
    isNullable: false,
  }),
);
```

### 7. Documente migrations complexas

```typescript
export class ComplexMigration1234567890004 implements MigrationInterface {
  /**
   * Esta migration faz o seguinte:
   * 1. Adiciona coluna status
   * 2. Migra dados do campo active para status
   * 3. Remove coluna active
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Implementação...
  }
}
```

## Troubleshooting

### Migration não está sendo detectada

Verifique `database.config.ts`:
```typescript
migrations: [__dirname + '/migrations/*{.ts,.js}'],
```

### Erro: "Migration has already been executed"

```bash
# Ver quais foram executadas
npm run typeorm -- migration:show

# Se necessário, reverter
npm run typeorm -- migration:revert
```

### Forçar re-execução (CUIDADO!)

```bash
# Limpar e recriar banco
npm run db:drop
npm run typeorm -- migration:run
```

### Migration quebrou o banco

```bash
# Reverter
npm run typeorm -- migration:revert

# Corrigir o arquivo
# Executar novamente
npm run typeorm -- migration:run
```

## Scripts package.json

Verifique se estes scripts existem em `package.json`:

```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show"
  }
}
```

## Exemplo do Projeto

No projeto, as migrations estão em:
```
back/src/database/migrations/
```

Migrations existentes:
- `1728000000000-genesis.ts` - Schema inicial
- `1735466400000-add-quote-optimized-index.ts` - Índices
- `1738275600000-add-wallet-totals.ts` - Campos calculados
- `1738500000000-create-alerts-table.ts` - Tabela de alertas
- E outras...

## Referências

- [TypeORM Migrations](https://typeorm.io/migrations)
- [Migration API](https://typeorm.io/migrations#migration-api)
