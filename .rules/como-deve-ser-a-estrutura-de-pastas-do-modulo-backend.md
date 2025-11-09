# [Como deve ser a estrutura de pastas do módulo no Backend?]()

> Padrão de organização de arquivos e pastas para módulos NestJS no projeto.

## [Estrutura Padrão de Módulo NestJS]()

Organização padrão de arquivos e pastas para módulos NestJS, seguindo convenções e boas práticas do framework.

```
src/modules/nome-do-modulo/
> nome-do-modulo.module.ts          # Configuração do módulo
> nome-do-modulo.controller.ts       # Rotas HTTP (endpoints)
> nome-do-modulo.service.ts          # Lógica de negócio CRUD simples
> entities/                          # Modelos de dados
>   > nome-do-modulo.entity.ts
> dto/                               # Data Transfer Objects
>   > create-nome-do-modulo.dto.ts
>   > update-nome-do-modulo.dto.ts
> use-cases/                         # Use-Cases com regras complexas (opcional)
>   > interfaces.ts                  # Interfaces segregadas
>   > regras-negocio.usecase.ts      # Implementação do use-case
> enums/                             # Enumerações (opcional)
    > nome-do-modulo-status.enum.ts
```

## [Descrição e Responsabilidade de Cada Arquivo do Módulo]()

Explicação detalhada da responsabilidade e conteúdo de cada tipo de arquivo na estrutura de um módulo.

### [Module (*.module.ts)]()

Declara e organiza o módulo:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NomeDoModuloController } from './nome-do-modulo.controller';
import { NomeDoModuloService } from './nome-do-modulo.service';
import { NomeDoModulo } from './entities/nome-do-modulo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NomeDoModulo]),
  ],
  controllers: [NomeDoModuloController],
  providers: [NomeDoModuloService],
  exports: [NomeDoModuloService], // Se outros módulos precisarem
})
export class NomeDoModuloModule {}
```

### [Controller (*.controller.ts)]()

Define os endpoints REST:

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('nome-do-modulo')
@ApiBearerAuth()
@Controller('nome-do-modulo')
export class NomeDoModuloController {
  constructor(private readonly service: NomeDoModuloService) {}

  @Post()
  create(@Body() dto: CreateDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.userId);
  }

  // Outros endpoints...
}
```

### [Service (*.service.ts)]()

Contém a lógica de negócio CRUD simples. Para regras complexas, use Use-Cases:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NomeDoModuloService {
  constructor(
    @InjectRepository(NomeDoModulo)
    private repository: Repository<NomeDoModulo>,
  ) {}

  // CRUD simples permanece no service
  async create(dto: CreateDto, userId: number) {
    const entity = this.repository.create({ ...dto, userId });
    return await this.repository.save(entity);
  }

  async findAll(userId: number) {
    return await this.repository.find({ where: { userId } });
  }

  // Para regras complexas, delegue para Use-Cases
}
```

### [Entity (entities/*.entity.ts)]()

Modelo de dados (tabela do banco):

```typescript
import { Entity, Column } from 'typeorm';
import { SuperEntity } from '@database/entities/super.entity';

@Entity('nome_tabela')
export class NomeDoModulo extends SuperEntity {
  @Column()
  nome: string;

  // Outros campos...
}
```

**IMPORTANTE**: A entity deve estar localizada **dentro do módulo**, não em uma pasta centralizada. A única entity centralizada é a `SuperEntity`.

### [DTOs (dto/*.dto.ts)]()

Validação de dados de entrada:

```typescript
// create-*.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNomeDoModuloDto {
  @IsString()
  @IsNotEmpty()
  nome: string;
}

// update-*.dto.ts
import { PartialType } from '@nestjs/swagger';

export class UpdateNomeDoModuloDto extends PartialType(CreateNomeDoModuloDto) {}
```

## [Quando Criar Pasta Use-Cases no Módulo]()

Use pasta `use-cases/` quando:
- Regras de negócio complexas com múltiplas transações
- Operações que envolvem múltiplas responsabilidades relacionadas
- Necessidade de alta testabilidade e baixo acoplamento

### [Exemplo]()

```
src/modules/financeiro/
> financeiro.module.ts
> financeiro.controller.ts
> financeiro.service.ts                    # CRUD simples
> use-cases/
    > interfaces.ts                        # Interfaces segregadas
    > regras-financeiras.usecase.ts        # Lógica de negócio complexa
```

```typescript
// use-cases/interfaces.ts
export interface CalcularSaldoAtual {
  calcularSaldoAtual(userId: number): Promise<number>;
}

export interface ProcessarInvestimento {
  processarInvestimento(userId: number, valor: number, tipo: string): Promise<boolean>;
}

// use-cases/regras-financeiras.usecase.ts
@Injectable()
export class RegrasFinanceirasUseCase
  implements CalcularSaldoAtual, ProcessarInvestimento
{
  async calcularSaldoAtual(userId: number): Promise<number> {
    // Implementação com múltiplas queries e regras
  }

  async processarInvestimento(userId: number, valor: number, tipo: string): Promise<boolean> {
    // Implementação com transações e validações complexas
  }
}
```

**Veja mais**: [Como criar Use-Cases](./como-criar-use-case-backend.md)

## [Quando Criar Enums no Módulo Backend]()

Use pasta `enums/` para valores fixos:

```typescript
// enums/alert-type.enum.ts
export enum AlertType {
  DAILY_VARIATION = 'daily_variation',
  PRICE_TARGET = 'price_target',
  VOLUME_SPIKE = 'volume_spike',
}

// Uso na entity
@Column({ type: 'enum', enum: AlertType })
type: AlertType;
```

## [Exemplos Reais: Módulos Simples e Complexos]()

Exemplos concretos de estruturas de módulos simples e complexos utilizados no projeto real.

### [Módulo Simples (Asset)]()

```
src/modules/asset/
> asset.module.ts
> asset.controller.ts
> asset.service.ts
> entities/
>   > asset.entity.ts
> dto/
    > create-asset.dto.ts
    > update-asset.dto.ts
```

### [Módulo Complexo (Financeiro)]()

```
src/modules/financeiro/
> financeiro.module.ts
> financeiro.controller.ts
> financeiro.service.ts
> entities/
>   > transacao.entity.ts
> dto/
>   > create-transacao.dto.ts
>   > processar-investimento.dto.ts
> use-cases/
>   > interfaces.ts
>   > regras-financeiras.usecase.ts
>   > calculos-tributarios.usecase.ts
> enums/
    > tipo-transacao.enum.ts
```

## [Convenções de Nomenclatura em Inglês para Classes e Interfaces]()

Tabela de referência com padrões de nomenclatura para cada tipo de arquivo e classe no módulo.

**IMPORTANTE**: Todas as classes, interfaces, entities, DTOs, enums e use-cases devem ser nomeados em **inglês**, seguindo as convenções internacionais de desenvolvimento TypeScript.

| Item | Padrão | Exemplo | Idioma |
|------|--------|---------|--------|
| Pasta do módulo | kebab-case | `asset-group` | inglês |
| Arquivo | kebab-case | `asset-group.service.ts` | inglês |
| Classe | PascalCase | `AssetGroupService` | inglês |
| Entity | PascalCase | `AssetGroup` | inglês |
| DTO | PascalCase | `CreateAssetGroupDto` | inglês |
| Interface (Use-Case) | PascalCase sem I | `CalculateBalance` | inglês |
| Use-Case | PascalCase com UseCase | `FinancialRulesUseCase` | inglês |
| Enum | PascalCase | `AssetStatus` | inglês |

**Exemplos de nomenclatura correta**:
- ✅ `ProcessInvestment`, `CalculateBalance`, `GenerateReport`
- ❌ `ProcessarInvestimento`, `CalcularSaldo`, `GerarRelatorio`

## [Organização de Módulo por Tamanho e Complexidade]()

Recomendações de organização de código baseadas no tamanho e complexidade do módulo.

### [Módulo Pequeno (< 300 linhas)]()

Mantenha tudo nos arquivos principais:
```
modulo/
> modulo.module.ts
> modulo.controller.ts
> modulo.service.ts
> entities/
>   > modulo.entity.ts
> dto/
    > create-modulo.dto.ts
    > update-modulo.dto.ts
```

### [Módulo Médio (300-1000 linhas)]()

Separe responsabilidades em use-cases:
```
modulo/
> modulo.module.ts
> modulo.controller.ts
> modulo.service.ts
> entities/
> dto/
> use-cases/
>   > interfaces.ts
    > regras-negocio.usecase.ts
```

### [Módulo Grande (> 1000 linhas)]()

Subdivida completamente com múltiplos use-cases:
```
modulo/
> modulo.module.ts
> modulo.controller.ts
> modulo.service.ts
> entities/
> dto/
> use-cases/
>   > interfaces.ts
>   > regras-negocio-a.usecase.ts
>   > regras-negocio-b.usecase.ts
> enums/
> guards/
    > modulo-permission.guard.ts
```

## [Localização dos Módulos na Estrutura do Projeto]()

Estrutura hierárquica de diretórios do projeto indicando onde os módulos de domínio devem ser criados.

```
back/src/
> app.module.ts          # Módulo raiz
> main.ts               # Entry point
> auth/                 # Autenticação (especial)
> common/               # Código compartilhado
> database/             # Configs e migrations
> modules/              # Módulos de domínio
    > asset/
    > wallet/
    > quote/
    > ...
```

## [Dicas Práticas para Organização de Módulos]()

1. **Um módulo = Uma responsabilidade**: Não misture domínios
2. **Comece simples**: Não crie pastas desnecessárias
3. **Refatore quando crescer**: Se passar de 300 linhas, separe
4. **Exporte services**: Se outros módulos precisarem usar
5. **DTOs separados**: Sempre em arquivo próprio
6. **Entities próprias**: Uma entity por arquivo

## [Referências]()

- [NestJS Module Documentation](https://docs.nestjs.com/modules)
