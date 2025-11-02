# Como criar uma Migration no Backend?

> Guia completo para criar e gerenciar migrations com TypeORM no projeto.

> **⚠️ IMPORTANTE**: Todas as migrations devem ser escritas usando SQL puro através de `queryRunner.query()`, não objetos TypeORM como `new Table()`, `new TableColumn()`, etc.

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
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 0,
        user_id INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_products_user_id ON products(user_id);
    `);

    await queryRunner.query(`
      ALTER TABLE products
        ADD CONSTRAINT fk_products_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE products;`);
  }
}
```

### 3. Executar a migration

```bash
npm run typeorm -- migration:run
```

## Tipos de Operações com SQL

### 1. Criar Tabela

```typescript
await queryRunner.query(`
  CREATE TABLE nome_da_tabela (
    id SERIAL PRIMARY KEY,
    campo VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
`);
```

### 2. Adicionar Coluna

```typescript
await queryRunner.query(`
  ALTER TABLE nome_da_tabela
    ADD COLUMN nova_coluna VARCHAR(255);
`);
```

### 3. Remover Coluna

```typescript
await queryRunner.query(`
  ALTER TABLE nome_da_tabela
    DROP COLUMN nome_da_coluna;
`);
```

### 4. Modificar Coluna

```typescript
await queryRunner.query(`
  ALTER TABLE nome_da_tabela
    ALTER COLUMN nome_coluna TYPE VARCHAR(500);
`);

// Renomear coluna
await queryRunner.query(`
  ALTER TABLE nome_da_tabela
    RENAME COLUMN nome_antigo TO nome_novo;
`);
```

### 5. Criar Índice

```typescript
await queryRunner.query(`
  CREATE INDEX idx_nome_campo ON nome_da_tabela(campo);
`);
```

### 6. Criar Índice Composto

```typescript
await queryRunner.query(`
  CREATE INDEX idx_campo1_campo2 ON nome_da_tabela(campo1, campo2);
`);
```

### 7. Adicionar Foreign Key

```typescript
await queryRunner.query(`
  ALTER TABLE tabela_filha
    ADD CONSTRAINT fk_tabela_filha_pai
    FOREIGN KEY (coluna_fk)
    REFERENCES tabela_pai(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
`);
```

### 8. Executar SQL Raw

```typescript
await queryRunner.query(`
  UPDATE users
  SET active = true
  WHERE created_at > '2024-01-01';
`);
```

### 9. Inserir Dados (Seed)

```typescript
await queryRunner.query(`
  INSERT INTO sectors (name, description)
  VALUES
    ('Tecnologia', 'Setor de tecnologia'),
    ('Financeiro', 'Setor financeiro'),
    ('Saúde', 'Setor de saúde');
`);
```

## Exemplo Completo: Adicionar Campo

### Migration: Adicionar campo `active` na tabela `products`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveToProducts1234567890001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN active;
    `);
  }
}
```

## Exemplo Completo: Adicionar Relacionamento

### Migration: Adicionar relacionamento `category_id` em `products`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToProducts1234567890002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna
    await queryRunner.query(`
      ALTER TABLE products
        ADD COLUMN category_id INT;
    `);

    // Adicionar foreign key
    await queryRunner.query(`
      ALTER TABLE products
        ADD CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    `);

    // Criar índice para performance
    await queryRunner.query(`
      CREATE INDEX idx_products_category_id ON products(category_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índice
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_products_category_id;
    `);

    // Remover foreign key
    await queryRunner.query(`
      ALTER TABLE products
        DROP CONSTRAINT IF EXISTS fk_products_category;
    `);

    // Remover coluna
    await queryRunner.query(`
      ALTER TABLE products
        DROP COLUMN category_id;
    `);
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
// Adicionar com nullable primeiro
await queryRunner.query(`
  ALTER TABLE products
    ADD COLUMN category_id INT;
`);

// Preencher dados
await queryRunner.query(`
  UPDATE products
  SET category_id = 1
  WHERE category_id IS NULL;
`);

// Depois tornar NOT NULL
await queryRunner.query(`
  ALTER TABLE products
    ALTER COLUMN category_id SET NOT NULL;
`);
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
