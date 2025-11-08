# [Como devem ser os comandos de migration no package.json do Backend?]()

> Configuração dos scripts npm para gerenciar migrations do TypeORM.

## [Scripts Necessários no package.json para Migrations]()

Esta seção apresenta os scripts npm essenciais para gerenciar migrations do TypeORM. Cada script é um atalho que facilita a execução de comandos como gerar, criar e executar migrations no projeto.

Lista de scripts npm essenciais para gerenciar migrations TypeORM:

Adicione no `package.json`:

```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show",
    "db:drop": "npm run typeorm -- schema:drop && npm run migration:run"
  }
}
```

## [Descrição Detalhada de cada Comando de Migration]()

Esta seção detalha cada comando de migration, explicando quando usar, o que faz e exemplos práticos de uso no dia a dia.

Explicação completa de cada script npm e seus parâmetros:

### [typeorm (Base)]()

```bash
npm run typeorm -- <comando>
```

Script base que executa o CLI do TypeORM com suporte a:
- TypeScript (ts-node)
- Path aliases (@/*) via tsconfig-paths

### [migration:generate]()

```bash
npm run migration:generate src/database/migrations/NomeDaMigration
```

**O que faz**: Gera migration automática comparando entities com banco de dados

**Quando usar**:
- Após alterar entities
- Adicionar/remover colunas
- Modificar relacionamentos

**Exemplo**:
```bash
npm run migration:generate src/database/migrations/AddActiveToProducts
```

### [migration:create]()

```bash
npm run migration:create src/database/migrations/NomeDaMigration
```

**O que faz**: Cria migration vazia para implementação manual

**Quando usar**:
- Seeds de dados
- Alterações complexas
- Índices customizados
- Queries SQL específicas

**Exemplo**:
```bash
npm run migration:create src/database/migrations/SeedSectors
```

### [migration:run]()

```bash
npm run migration:run
```

**O que faz**: Executa todas as migrations pendentes em ordem

**Quando usar**:
- Após criar/gerar migrations
- Setup de ambiente novo
- Deploy em produção

### [migration:revert]()

```bash
npm run migration:revert
```

**O que faz**: Reverte a última migration executada

**Quando usar**:
- Corrigir migration com erro
- Rollback de alteração

**Nota**: Executa o método `down()` da migration

### [migration:show]()

```bash
npm run migration:show
```

**O que faz**: Lista migrations executadas e pendentes

**Saída**:
```
[X] Migration1728000000000-genesis
[X] Migration1735466400000-add-quote-optimized-index
[ ] Migration1738500000000-create-alerts-table
```

### [db:drop]()

```bash
npm run db:drop
```

**O que faz**: Dropa todo o schema e recria executando migrations

**Quando usar**:
- Reset completo do banco
- Desenvolvimento local
- Testes

**  CUIDADO**: Apaga todos os dados!

## [Fluxo de Trabalho para criar e aplicar Migrations]()

Sequência de comandos para workflow completo de migrations:

### [1. Criar nova entity]()

```typescript
// src/modules/product/entities/product.entity.ts
@Entity('products')
export class Product extends SuperEntity {
  @Column()
  name: string;
}
```

### [2. Gerar migration]()

```bash
npm run migration:generate src/database/migrations/CreateProductsTable
```

### [3. Revisar migration gerada]()

```typescript
// src/database/migrations/1234567890000-CreateProductsTable.ts
export class CreateProductsTable1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(/* ... */);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
  }
}
```

### [4. Executar migration]()

```bash
npm run migration:run
```

### [5. Se houver erro]()

```bash
# Reverter
npm run migration:revert

# Corrigir arquivo
# Executar novamente
npm run migration:run
```

## [Configuração do DataSource para TypeORM CLI]()

Arquivo database.config.ts necessário para comandos de migration:

Para os comandos funcionarem, configure `database.config.ts`:

```typescript
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  synchronize: false,
  logging: true,
});
```

## [Dependências Necessárias para executar Migrations]()

Pacotes npm requeridos para TypeORM CLI funcionar:

```json
{
  "devDependencies": {
    "ts-node": "^10.x",
    "tsconfig-paths": "^4.x",
    "typescript": "^5.x"
  },
  "dependencies": {
    "typeorm": "^0.3.x",
    "pg": "^8.x"
  }
}
```

## [Scripts Adicionais Úteis para desenvolvimento]()

Comandos extras para seed, backup e verificação de migrations:

### [Seed de Dados]()

```json
{
  "scripts": {
    "seed": "ts-node -r tsconfig-paths/register src/database/seeds/run.ts"
  }
}
```

### [Verificar Conexão]()

```json
{
  "scripts": {
    "db:check": "npm run typeorm -- query 'SELECT NOW()'"
  }
}
```

### [Backup/Restore (Produção)]()

```json
{
  "scripts": {
    "db:backup": "pg_dump -h $DB_HOST -U $DB_USERNAME $DB_DATABASE > backup.sql",
    "db:restore": "psql -h $DB_HOST -U $DB_USERNAME $DB_DATABASE < backup.sql"
  }
}
```

## [Integração com CI/CD para Migrations automáticas]()

Como executar migrations em pipelines GitHub Actions e Docker:

### [GitHub Actions]()

```yaml
# .github/workflows/deploy.yml
- name: Run Migrations
  run: npm run migration:run
  env:
    DB_HOST: ${{ secrets.DB_HOST }}
    DB_USERNAME: ${{ secrets.DB_USERNAME }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

### [Docker]()

```dockerfile
# Dockerfile
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]
```

## [Troubleshooting - Erros comuns com comandos de Migration]()

Soluções para problemas frequentes ao executar migrations:

### [Erro: "Cannot find module"]()

**Solução**: Instale `ts-node` e `tsconfig-paths`

```bash
npm install -D ts-node tsconfig-paths
```

### [Erro: "No migrations found"]()

**Solução**: Verifique o caminho em `database.config.ts`:

```typescript
migrations: [__dirname + '/migrations/*{.ts,.js}']
```

### [Migrations não executam]()

**Solução**: Verifique variáveis de ambiente:

```bash
echo $DB_HOST
echo $DB_USERNAME
```

## [Exemplo Completo de package.json com todos scripts]()

Package.json completo com todos comandos de migration configurados:

```json
{
  "name": "backend",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",

    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show",
    "db:drop": "npm run typeorm -- schema:drop && npm run migration:run",

    "test": "jest",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
  }
}
```

## [Referências e documentação TypeORM CLI]()

Links para documentação oficial do TypeORM CLI:

- [TypeORM Migrations CLI](https://typeorm.io/migrations#creating-a-new-migration)
- [NestJS TypeORM](https://docs.nestjs.com/recipes/sql-typeorm)
