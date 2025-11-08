# [Como deve ser a estrutura de pastas do módulo no Backend?]()

> Padrão de organização de arquivos e pastas para módulos NestJS no projeto.

## [Estrutura Padrão]()

```
src/modules/nome-do-modulo/
> nome-do-modulo.module.ts          # Configuração do módulo
> nome-do-modulo.controller.ts       # Rotas HTTP (endpoints)
> nome-do-modulo.service.ts          # Lógica de negócio principal
> entities/                          # Modelos de dados
>   > nome-do-modulo.entity.ts
> dto/                               # Data Transfer Objects
>   > create-nome-do-modulo.dto.ts
>   > update-nome-do-modulo.dto.ts
> interfaces/                        # Contratos (opcional)
>   > nome-do-modulo.interface.ts
> enums/                             # Enumerações (opcional)
>   > nome-do-modulo-status.enum.ts
> services/                          # Sub-services (opcional)
    > nome-do-modulo-helper.service.ts
```

## [Descrição dos Arquivos]()

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

Contém a lógica de negócio:

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

  async create(dto: CreateDto, userId: number) {
    const entity = this.repository.create({ ...dto, userId });
    return await this.repository.save(entity);
  }

  // Outros métodos...
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

## [Quando Criar Sub-services]()

Use pasta `services/` quando:
- Lógica complexa que merece separação
- Integração com APIs externas
- Processamento pesado

### [Exemplo]()

```
src/modules/providers/
> providers.module.ts
> providers.service.ts           # Orquestrador
> providers.controller.ts
> services/
    > kinvo-provider.service.ts  # Integração Kinvo
    > yahoo-provider.service.ts  # Integração Yahoo
    > b3-provider.service.ts     # Integração B3
```

```typescript
// providers.service.ts
@Injectable()
export class ProvidersService {
  constructor(
    private kinvoProvider: KinvoProviderService,
    private yahooProvider: YahooProviderService,
  ) {}

  async syncQuotes(provider: string) {
    if (provider === 'kinvo') {
      return this.kinvoProvider.syncQuotes();
    }
    return this.yahooProvider.syncQuotes();
  }
}
```

## [Quando Usar Interfaces]()

Use pasta `interfaces/` para:
- Contratos de serviços
- Tipos complexos compartilhados
- Definição de comportamentos

### [Exemplo]()

```typescript
// interfaces/provider.interface.ts
export interface IQuoteProvider {
  syncQuotes(assets: string[]): Promise<Quote[]>;
  getQuote(symbol: string): Promise<Quote>;
}

// services/kinvo-provider.service.ts
@Injectable()
export class KinvoProviderService implements IQuoteProvider {
  async syncQuotes(assets: string[]): Promise<Quote[]> {
    // Implementação
  }

  async getQuote(symbol: string): Promise<Quote> {
    // Implementação
  }
}
```

## [Quando Usar Enums]()

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

## [Exemplo Real do Projeto]()

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

### [Módulo Complexo (Rebalance)]()

```
src/modules/rebalance/
> rebalance.module.ts
> rebalance.controller.ts
> rebalance.service.ts
> entities/
>   > rebalance-recommendation.entity.ts
> dto/
>   > analyze-rebalance.dto.ts
>   > strategy.dto.ts
> services/
>   > signal-engine.service.ts
>   > portfolio-analyzer.service.ts
> interfaces/
>   > strategy.interface.ts
> enums/
    > signal-type.enum.ts
```

## [Convenções de Nomenclatura]()

| Item | Padrão | Exemplo |
|------|--------|---------|
| Pasta do módulo | kebab-case | `asset-group` |
| Arquivo | kebab-case | `asset-group.service.ts` |
| Classe | PascalCase | `AssetGroupService` |
| Entity | PascalCase | `AssetGroup` |
| DTO | PascalCase | `CreateAssetGroupDto` |
| Interface | PascalCase com I | `IAssetProvider` |
| Enum | PascalCase | `AssetStatus` |

## [Organização por Tamanho]()

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

Separe responsabilidades em sub-services:
```
modulo/
> modulo.module.ts
> modulo.controller.ts
> modulo.service.ts
> entities/
> dto/
> services/
    > modulo-helper.service.ts
```

### [Módulo Grande (> 1000 linhas)]()

Subdivida completamente:
```
modulo/
> modulo.module.ts
> modulo.controller.ts
> modulo.service.ts
> entities/
> dto/
> services/
> interfaces/
> enums/
> guards/
    > modulo-permission.guard.ts
```

## [Localização dos Módulos]()

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

## [Dicas]()

1. **Um módulo = Uma responsabilidade**: Não misture domínios
2. **Comece simples**: Não crie pastas desnecessárias
3. **Refatore quando crescer**: Se passar de 300 linhas, separe
4. **Exporte services**: Se outros módulos precisarem usar
5. **DTOs separados**: Sempre em arquivo próprio
6. **Entities próprias**: Uma entity por arquivo

## [Referências]()

- [NestJS Module Documentation](https://docs.nestjs.com/modules)
