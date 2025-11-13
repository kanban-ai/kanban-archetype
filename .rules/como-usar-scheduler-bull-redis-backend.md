# [Como usar Scheduler com Bull no Backend]()

> Guia completo para agendar tarefas com cron usando Bull e decorator @Cron que encapsula toda a complexidade

## [Quando usar Scheduler com Bull]()

Esta seção define os recursos do Bull Scheduler para tarefas agendadas.

- ✅ **Tarefas agendadas distribuídas** - Múltiplas instâncias da aplicação sem duplicação
- ✅ **Escalabilidade horizontal** - Scheduler funciona corretamente com múltiplas instâncias
- ✅ **Persistência** - Jobs sobrevivem a reinicializações do servidor
- ✅ **Retry automático** - Jobs que falharam são reprocessados automaticamente
- ✅ **Monitoramento** - Dashboard Bull Board para visualizar agendamentos
- ✅ **Coordenação via Redis** - Garante execução única mesmo com múltiplas instâncias

**IMPORTANTE:** Este guia foca exclusivamente em **scheduler** (tarefas agendadas com cron). Para filas e processamento assíncrono de mensagens, use RabbitMQ (consulte `./como-usar-rabbitmq-backend.md`).

## [Recursos do Bull Scheduler]()

Recursos disponíveis para tarefas agendadas com Bull.

| Recurso | Descrição |
|---------|-----------|
| **Execução distribuída** | ✅ Apenas uma instância executa mesmo com múltiplas réplicas |
| **Persistência** | ✅ Jobs sobrevivem a reinicializações do servidor |
| **Retry automático** | ✅ Configurável com backoff exponencial |
| **Escala horizontal** | ✅ Coordenado automaticamente via Redis |
| **Dashboard visual** | ✅ Bull Board UI para monitoramento |
| **Timezone** | ✅ Suporte a diferentes timezones por job |
| **Monitoramento** | ✅ Histórico de execuções e falhas |

## [Instalação das dependências]()

```bash
npm install bull @nestjs/bull
npm install -D @types/bull
```

**Nota:** Bull usa Redis como backend. Certifique-se de que o Redis está configurado (consulte `./como-usar-redis-backend.md`).

## [Estrutura de pastas simplificada]()

Organização recomendada para schedulers:

```
src/
├── common/
│   ├── decorators/
│   │   └── cron.decorator.ts          # Decorator @Cron (encapsula Bull)
│   └── scheduler/
│       └── scheduler.module.ts        # Módulo global Scheduler
├── modules/
│   └── reports/
│       ├── schedulers/
│       │   └── reports.scheduler.ts   # Schedulers do módulo
│       ├── reports.module.ts
│       └── reports.service.ts
```

## [Passo 1: Configurar SchedulerModule Global]()

Criar módulo global que configura Bull uma única vez.

**Arquivo:** `src/common/scheduler/scheduler.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class SchedulerModule {}
```

**Registrar no AppModule:**

```typescript
import { Module } from '@nestjs/common';
import { SchedulerModule } from './common/scheduler/scheduler.module';

@Module({
  imports: [
    SchedulerModule, // Registrar globalmente
    // outros módulos...
  ],
})
export class AppModule {}
```

## [Passo 2: Criar Decorator @Cron que encapsula complexidade]()

Este decorator encapsula TODA a complexidade do Bull. Você só precisa decorar métodos.

**Arquivo:** `src/common/decorators/cron.decorator.ts`

```typescript
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

const CRON_METADATA_KEY = 'scheduler:cron';

export interface CronOptions {
  name?: string;
  timezone?: string;
}

/**
 * Decorator para agendar métodos com expressão cron
 *
 * @param expression - Expressão cron (ex: '0 * * * *' para toda hora)
 * @param options - Opções opcionais (nome, timezone)
 *
 * @example
 * ```typescript
 * @Cron('0 2 * * *', { name: 'daily-report', timezone: 'America/Sao_Paulo' })
 * async generateDailyReport() {
 *   console.log('Relatório diário gerado');
 * }
 * ```
 */
export function Cron(expression: string, options?: CronOptions): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(CRON_METADATA_KEY, { expression, options }, target, propertyKey);
  };
}

/**
 * Serviço que registra automaticamente todos os métodos decorados com @Cron
 *
 * IMPORTANTE: Este serviço deve estar em providers do AppModule (root module)
 */
@Injectable()
export class CronSchedulerRegistry implements OnModuleInit {
  private readonly logger = new Logger(CronSchedulerRegistry.name);
  private readonly queueName = 'scheduler';

  constructor(
    @InjectQueue('scheduler') private readonly queue: Queue,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Iniciando registro de schedulers...');
    await this.registerCronJobs();
  }

  private async registerCronJobs(): Promise<void> {
    const providers = this.discoveryService.getProviders();
    this.logger.log(`Total de providers encontrados: ${providers.length}`);

    let totalJobs = 0;

    for (const wrapper of providers) {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') continue;

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const metadata = Reflect.getMetadata(CRON_METADATA_KEY, prototype, methodName);

        if (metadata) {
          this.logger.log(
            `Encontrado scheduler: ${instance.constructor.name}.${methodName}`,
          );
          await this.registerJob(instance, methodName, metadata);
          totalJobs++;
        }
      }
    }

    this.logger.log(`Total de schedulers registrados: ${totalJobs}`);
  }

  private async registerJob(
    instance: object,
    methodName: string,
    metadata: { expression: string; options?: CronOptions },
  ): Promise<void> {
    const { expression, options } = metadata;
    const jobName = options?.name || `${instance.constructor.name}.${methodName}`;

    try {
      await this.queue.add(
        jobName,
        { instance: instance.constructor.name, method: methodName },
        {
          repeat: {
            cron: expression,
            tz: options?.timezone || 'UTC',
          },
          jobId: `cron:${jobName}`,
        },
      );

      // Registrar processor dinamicamente
      this.queue.process(jobName, async (job) => {
        this.logger.log(`Executando: ${job.name}`);
        await instance[methodName].call(instance);
      });

      this.logger.log(
        `✅ Scheduler registrado: ${jobName} | Cron: ${expression} | Timezone: ${options?.timezone || 'UTC'}`,
      );
    } catch (error) {
      this.logger.error(`Erro ao registrar scheduler ${jobName}:`, error.stack);
    }
  }
}
```

## [Passo 3: Configurar módulo Scheduler no AppModule]()

Adicionar fila e registry no módulo raiz.

**Arquivo:** `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DiscoveryModule } from '@nestjs/core';
import { SchedulerModule } from './common/scheduler/scheduler.module';
import { CronSchedulerRegistry } from './common/decorators/cron.decorator';

@Module({
  imports: [
    SchedulerModule,
    DiscoveryModule,
    BullModule.registerQueue({ name: 'scheduler' }),
    // outros módulos...
  ],
  providers: [
    CronSchedulerRegistry, // Registry que auto-registra @Cron
  ],
})
export class AppModule {}
```

## [Passo 4: Usar @Cron nos seus schedulers]()

Agora basta decorar métodos com @Cron - toda complexidade está encapsulada!

**Arquivo:** `src/modules/reports/schedulers/reports.scheduler.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@/common/decorators/cron.decorator';
import { ReportsService } from '../reports.service';

@Injectable()
export class ReportsScheduler {
  private readonly logger = new Logger(ReportsScheduler.name);

  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Gerar relatório diário às 2h da manhã (timezone São Paulo)
   */
  @Cron('0 2 * * *', { name: 'daily-report', timezone: 'America/Sao_Paulo' })
  async generateDailyReport(): Promise<void> {
    this.logger.log('Iniciando geração de relatório diário');

    try {
      await this.reportsService.generateDailyReport();
      this.logger.log('Relatório diário gerado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao gerar relatório diário', error.stack);
      throw error; // Bull fará retry automático
    }
  }

  /**
   * Limpar dados antigos toda segunda-feira às 3h
   */
  @Cron('0 3 * * 1', { name: 'weekly-cleanup' })
  async cleanupOldData(): Promise<void> {
    this.logger.log('Iniciando limpeza semanal');
    await this.reportsService.cleanupOldData();
  }

  /**
   * Verificar integrações a cada 15 minutos
   */
  @Cron('*/15 * * * *', { name: 'check-integrations' })
  async checkIntegrations(): Promise<void> {
    this.logger.log('Verificando integrações');
    await this.reportsService.checkIntegrations();
  }
}
```

**Registrar no módulo:**

```typescript
import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsScheduler } from './schedulers/reports.scheduler';

@Module({
  providers: [
    ReportsService,
    ReportsScheduler, // Apenas adicionar em providers
  ],
})
export class ReportsModule {}
```

**Pronto!** Os schedulers serão automaticamente registrados no Bull quando a aplicação iniciar.

## [Exemplo: Expressões Cron Comuns]()

Referência rápida de expressões cron para agendamentos frequentes.

```typescript
// A cada minuto
@Cron('* * * * *')

// A cada 5 minutos
@Cron('*/5 * * * *')

// A cada hora (no minuto 0)
@Cron('0 * * * *')

// Todo dia às 2h da manhã
@Cron('0 2 * * *')

// Toda segunda-feira às 9h
@Cron('0 9 * * 1')

// Primeiro dia do mês às 00:00
@Cron('0 0 1 * *')

// De segunda a sexta às 8h
@Cron('0 8 * * 1-5')

// A cada 15 minutos entre 9h e 17h
@Cron('*/15 9-17 * * *')
```

**Formato:** `minuto hora dia mês dia_da_semana`

- `*` = qualquer valor
- `*/n` = a cada n unidades
- `n-m` = intervalo de n até m
- `n,m` = valores específicos n e m

**Testar expressões:** https://crontab.guru

## [Como adicionar Bull Board Dashboard]()

Bull Board fornece UI web para monitorar schedulers em tempo real.

**Instalar:**

```bash
npm install @bull-board/api @bull-board/nestjs @bull-board/express
```

**Configurar:**

**Arquivo:** `src/common/scheduler/bull-board.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'scheduler',
      adapter: ExpressAdapter,
    }),
  ],
})
export class BullBoardConfigModule {}
```

**Registrar no AppModule:**

```typescript
import { Module } from '@nestjs/common';
import { BullBoardConfigModule } from './common/scheduler/bull-board.module';

@Module({
  imports: [
    BullBoardConfigModule,
    // outros módulos...
  ],
})
export class AppModule {}
```

**Acessar:**
```
http://localhost:3000/admin/queues
```

**IMPORTANTE:** Proteger com autenticação em produção (API Key ou JWT).

## [Variáveis de Ambiente]()

Adicionar ao arquivo `.env`:

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## [Testando Schedulers]()

**Testar método diretamente (sem Bull):**

```typescript
import { Test } from '@nestjs/testing';
import { ReportsScheduler } from './reports.scheduler';
import { ReportsService } from './reports.service';

describe('ReportsScheduler', () => {
  let scheduler: ReportsScheduler;
  let service: ReportsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReportsScheduler,
        {
          provide: ReportsService,
          useValue: {
            generateDailyReport: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    scheduler = module.get(ReportsScheduler);
    service = module.get(ReportsService);
  });

  it('deve gerar relatório diário', async () => {
    await scheduler.generateDailyReport();

    expect(service.generateDailyReport).toHaveBeenCalled();
  });
});
```

## [Disparar Scheduler Manualmente via API]()

Útil para testes e debugging.

**Arquivo:** `src/modules/reports/reports.controller.ts`

```typescript
import { Controller, Post, Param } from '@nestjs/common';
import { ReportsScheduler } from './schedulers/reports.scheduler';

@Controller('reports')
export class ReportsController {
  constructor(private readonly scheduler: ReportsScheduler) {}

  /**
   * Dispara scheduler manualmente
   * POST /reports/trigger/daily-report
   */
  @Post('trigger/:jobName')
  async triggerJob(@Param('jobName') jobName: string): Promise<{ message: string }> {
    // Mapear nome do job para método
    const jobMethods = {
      'daily-report': () => this.scheduler.generateDailyReport(),
      'weekly-cleanup': () => this.scheduler.cleanupOldData(),
      'check-integrations': () => this.scheduler.checkIntegrations(),
    };

    const method = jobMethods[jobName];
    if (!method) {
      throw new Error(`Job ${jobName} não encontrado`);
    }

    await method();

    return { message: `Job ${jobName} executado com sucesso` };
  }
}
```

## [Boas Práticas]()

Checklist de implementação para garantir qualidade e escalabilidade.

- ✅ **SchedulerModule global** - Configurar uma única vez, usar em todos os módulos
- ✅ **CronSchedulerRegistry no AppModule** - Registrar no root module
- ✅ **Configurar retry e backoff** - Pelo menos 3 tentativas com exponential backoff
- ✅ **Logging adequado** - Logger do NestJS em todos os schedulers
- ✅ **Tratamento de erro** - Try/catch e throw para trigger retry
- ✅ **Timezone explícito** - Sempre definir timezone nas opções
- ✅ **Nomenclatura clara** - Nome descritivo para cada scheduler
- ✅ **Documentar expressões cron** - Comentário explicando quando executa
- ✅ **Testar schedulers** - Testes unitários chamando métodos diretamente
- ✅ **Bull Board em desenvolvimento** - Facilita debug e monitoramento
- ✅ **jobId único** - `cron:${jobName}` para evitar duplicação
- ❌ **NUNCA expor Bull Board em produção sem auth** - Usar API Key ou JWT
- ❌ **NUNCA usar para filas** - Use RabbitMQ para mensagens assíncronas
- ❌ **NUNCA adicionar lógica pesada** - Delegar para services

## [Troubleshooting]()

Problemas comuns e soluções:

### [Scheduler executando múltiplas vezes]()

**Problema:** Job duplicado em cada instância da aplicação.

**Causa:** `jobId` não está configurado corretamente.

**Solução:** O decorator já configura `jobId: 'cron:${jobName}'` automaticamente. Verificar se há múltiplos registros.

### [Scheduler não está executando]()

**Diagnóstico:**
1. Verificar se Redis está rodando: `docker ps`
2. Verificar logs da aplicação para mensagem "Scheduler registrado"
3. Verificar Bull Board: `http://localhost:3000/admin/queues`
4. Testar expressão cron em https://crontab.guru

### [Nenhum scheduler sendo registrado]()

**Problema:** Logs mostram `Total de schedulers registrados: 0` mas você tem métodos com `@Cron`.

**Diagnóstico:**
1. Verificar se `DiscoveryModule` está importado no AppModule
2. Verificar se schedulers estão em `providers` dos módulos
3. Verificar se `CronSchedulerRegistry` está em `providers` do AppModule
4. Verificar logs para ver se providers foram encontrados

### [Erro "Cannot find module @nestjs/core"]()

**Causa:** Pacote `@nestjs/core` não instalado ou versão incompatível.

**Solução:**
```bash
npm install @nestjs/core
```

### [CronSchedulerRegistry não está descobrindo schedulers]()

**Causa:** `DiscoveryModule` não está importado.

**Solução:** Adicionar no AppModule:
```typescript
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DiscoveryModule, ...],
})
```

## [Como verificar se schedulers foram registrados]()

Ao iniciar a aplicação, você DEVE ver logs como estes:

```bash
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Iniciando registro de schedulers...
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Total de providers encontrados: 45
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Encontrado scheduler: ReportsScheduler.generateDailyReport
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] ✅ Scheduler registrado: daily-report | Cron: 0 2 * * * | Timezone: America/Sao_Paulo
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Encontrado scheduler: ReportsScheduler.cleanupOldData
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] ✅ Scheduler registrado: weekly-cleanup | Cron: 0 3 * * 1 | Timezone: UTC
[Nest] 12345  - 13/11/2025, 10:30:15     LOG [CronSchedulerRegistry] Total de schedulers registrados: 2
```

**❌ Se aparecer `Total de schedulers registrados: 0`:**
- Verifique se `DiscoveryModule` está importado no AppModule
- Verifique se os schedulers estão em `providers` dos módulos
- Verifique se `CronSchedulerRegistry` está em `providers` do AppModule

**✅ Se aparecer o número correto de schedulers:**
- Tudo funcionando corretamente!
- Acesse Bull Board para confirmar: `http://localhost:3000/admin/queues`

## [Checklist de Implementação]()

- [ ] Redis instalado e rodando
- [ ] Pacotes Bull instalados (`@nestjs/bull`, `bull`)
- [ ] `SchedulerModule` criado em `src/common/scheduler/`
- [ ] `CronSchedulerRegistry` criado em `src/common/decorators/cron.decorator.ts`
- [ ] Decorator `@Cron` exportado
- [ ] Fila `scheduler` registrada no AppModule
- [ ] `CronSchedulerRegistry` adicionado em providers do AppModule
- [ ] `DiscoveryModule` importado no AppModule
- [ ] Schedulers criados com métodos decorados por `@Cron`
- [ ] Schedulers adicionados em providers dos módulos
- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Bull Board configurado para desenvolvimento
- [ ] Logs aparecem mostrando schedulers registrados (verificar "Total de schedulers registrados")
- [ ] Testes unitários para schedulers
- [ ] Timezone definido em cada `@Cron`
- [ ] Logging adequado em todos os schedulers

## [Resumo: Como usar em 4 passos]()

### [1. Setup inicial (uma vez)]()

```bash
# Instalar
npm install bull @nestjs/bull

# Criar SchedulerModule (src/common/scheduler/scheduler.module.ts)
# Criar decorator @Cron (src/common/decorators/cron.decorator.ts)
# Registrar no AppModule
```

### [2. Criar scheduler]()

```typescript
@Injectable()
export class MyScheduler {
  @Cron('0 * * * *', { name: 'hourly-task' })
  async myTask() {
    console.log('Executado toda hora');
  }
}
```

### [3. Registrar no módulo]()

```typescript
@Module({
  providers: [MyScheduler],
})
export class MyModule {}
```

### [4. Pronto!]()

O scheduler será automaticamente registrado quando a aplicação iniciar.

---

**Documentação gerada por**: Claude Code
**Última atualização**: 13 de novembro de 2025
