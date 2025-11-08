# [Como Tratar Datas - Backend e Frontend]()

> Guia completo sobre o tratamento correto de datas no backend e frontend, usando ISODate UTC no banco de dados e dayjs para manipulação.

## [📋 Princípios Fundamentais]()

Conceitos essenciais para tratamento correto de datas em sistemas distribuídos, garantindo consistência entre banco, backend e frontend.

### [Regra de Ouro]()

1. **Banco de Dados**: Sempre gravar em **ISODate UTC** (GMT-0)
2. **Backend**: Sempre manipular em **UTC** (GMT-0)
3. **Frontend**: Transformar para GMT do usuário **apenas na exibição**

### [Por que UTC?]()

- Evita problemas com horário de verão
- Facilita sincronização entre servidores em diferentes regiões
- Elimina ambiguidade em sistemas distribuídos
- Simplifica cálculos e comparações de datas

## [🗄️ Banco de Dados - PostgreSQL]()

Configuração de tipos de colunas e migrations para armazenamento correto de datas em UTC no PostgreSQL.

### [Tipo de Coluna]()

```typescript
@Entity('eventos')
export class Evento extends SuperEntity {
  @Column({ type: 'timestamptz' })
  data_evento: Date;

  @Column({ type: 'timestamptz' })
  data_inicio: Date;

  @Column({ type: 'timestamptz', nullable: true })
  data_fim: Date;
}
```

**Importante**: Use `timestamptz` ao invés de `timestamp with time zone` para garantir que o TypeORM sempre trabalhe com UTC.

### [Migration]()

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventosTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "eventos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "data_evento" TIMESTAMPTZ NOT NULL,
        "data_inicio" TIMESTAMPTZ NOT NULL,
        "data_fim" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eventos" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "eventos";`);
  }
}
```

**Importante**: Use `TIMESTAMPTZ` nas migrations SQL. É a abreviação de `TIMESTAMP WITH TIME ZONE` e garante armazenamento em UTC.

### [Observações PostgreSQL]()

- `TIMESTAMPTZ` é a abreviação de `TIMESTAMP WITH TIME ZONE`
- Armazena sempre em UTC internamente
- PostgreSQL converte automaticamente para UTC ao inserir
- Ao consultar, PostgreSQL pode converter para timezone da conexão
- **Use `timestamptz` nas entities TypeORM e `TIMESTAMPTZ` nas migrations SQL**

## [🔧 Backend - NestJS]()

Implementação de manipulação de datas em UTC usando dayjs no backend, incluindo validação de DTOs e operações em services.

### [Instalação do dayjs]()

```bash
npm install dayjs
```

### [Configuração do dayjs]()

Crie um arquivo de configuração (opcional):

```typescript
// src/config/dayjs.config.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Carregar plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;
```

### [DTO - Receber Data do Frontend]()

```typescript
import { IsISO8601, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventoDto {
  @ApiProperty({
    example: '2025-11-02T14:30:00Z',
    description: 'Data e hora do evento em formato ISO 8601 UTC'
  })
  @IsISO8601()
  data_evento: string;

  @ApiProperty({
    example: '2025-11-02T09:00:00Z',
    description: 'Data e hora de início em formato ISO 8601 UTC'
  })
  @IsISO8601()
  data_inicio: string;

  @ApiProperty({
    example: '2025-11-02T18:00:00Z',
    description: 'Data e hora de término em formato ISO 8601 UTC',
    required: false
  })
  @IsISO8601()
  @IsOptional()
  data_fim?: string;
}
```

### [Service - Manipulação de Datas]()

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Evento } from './entities/evento.entity';
import { CreateEventoDto } from './dto/create-evento.dto';

dayjs.extend(utc);

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
  ) {}

  async create(createEventoDto: CreateEventoDto) {
    // Converter string ISO para Date UTC
    const evento = this.eventoRepository.create({
      ...createEventoDto,
      data_evento: dayjs.utc(createEventoDto.data_evento).toDate(),
      data_inicio: dayjs.utc(createEventoDto.data_inicio).toDate(),
      data_fim: createEventoDto.data_fim
        ? dayjs.utc(createEventoDto.data_fim).toDate()
        : null,
    });

    return await this.eventoRepository.save(evento);
  }

  async findEventosEntreDatas(dataInicio: string, dataFim: string) {
    // Sempre trabalhar em UTC
    const inicio = dayjs.utc(dataInicio).toDate();
    const fim = dayjs.utc(dataFim).toDate();

    return await this.eventoRepository
      .createQueryBuilder('evento')
      .where('evento.data_evento >= :inicio', { inicio })
      .andWhere('evento.data_evento <= :fim', { fim })
      .getMany();
  }

  async findEventosProximos7Dias() {
    // Calcular 7 dias a partir de agora em UTC
    const agora = dayjs.utc();
    const daquiA7Dias = agora.add(7, 'day');

    return await this.eventoRepository
      .createQueryBuilder('evento')
      .where('evento.data_evento >= :agora', { agora: agora.toDate() })
      .andWhere('evento.data_evento <= :limite', { limite: daquiA7Dias.toDate() })
      .orderBy('evento.data_evento', 'ASC')
      .getMany();
  }

  async calcularDuracaoEvento(eventoId: string) {
    const evento = await this.eventoRepository.findOne({
      where: { id: eventoId }
    });

    if (!evento || !evento.data_fim) {
      return null;
    }

    // Calcular diferença em UTC
    const inicio = dayjs.utc(evento.data_inicio);
    const fim = dayjs.utc(evento.data_fim);

    return {
      horas: fim.diff(inicio, 'hour'),
      minutos: fim.diff(inicio, 'minute'),
      dias: fim.diff(inicio, 'day'),
    };
  }
}
```

### [Controller - Retornar Datas]()

```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';

@ApiTags('Eventos')
@ApiBearerAuth()
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo evento' })
  async create(@Body() createEventoDto: CreateEventoDto) {
    return await this.eventosService.create(createEventoDto);
  }

  @Get('proximos')
  @ApiOperation({ summary: 'Listar eventos dos próximos 7 dias' })
  async findProximos() {
    return await this.eventosService.findEventosProximos7Dias();
  }

  @Get('entre-datas')
  @ApiOperation({ summary: 'Buscar eventos entre datas' })
  async findEntreDatas(
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
  ) {
    return await this.eventosService.findEventosEntreDatas(inicio, fim);
  }

  @Get(':id/duracao')
  @ApiOperation({ summary: 'Calcular duração do evento' })
  async calcularDuracao(@Param('id') id: string) {
    return await this.eventosService.calcularDuracaoEvento(id);
  }
}
```

### [Operações Comuns com dayjs (Backend)]()

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Sempre usar .utc() para trabalhar em UTC
const agora = dayjs.utc(); // Data/hora atual em UTC
const data = dayjs.utc('2025-11-02T14:30:00Z'); // Parse em UTC

// Adicionar/Subtrair tempo
const futuro = dayjs.utc().add(7, 'day');
const passado = dayjs.utc().subtract(1, 'month');

// Formatação (apenas para logs, não para exibição ao usuário)
const formatado = dayjs.utc().format('YYYY-MM-DD HH:mm:ss');

// Comparações
const isDepois = dayjs.utc(data1).isAfter(dayjs.utc(data2));
const isAntes = dayjs.utc(data1).isBefore(dayjs.utc(data2));
const isMesmo = dayjs.utc(data1).isSame(dayjs.utc(data2));

// Diferenças
const diffDias = dayjs.utc(data2).diff(dayjs.utc(data1), 'day');
const diffHoras = dayjs.utc(data2).diff(dayjs.utc(data1), 'hour');

// Início/Fim de períodos
const inicioDia = dayjs.utc().startOf('day');
const fimMes = dayjs.utc().endOf('month');

// Converter para Date (para salvar no banco)
const dateObject = dayjs.utc().toDate();
```

## [🎨 Frontend - React]()

Conversão de datas UTC para timezone do usuário, formatação para exibição e submissão de formulários com datas.

### [Instalação do dayjs]()

```bash
npm install dayjs
```

### [Configuração do dayjs]()

```typescript
// src/config/dayjs.config.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

// Carregar plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Configurar locale padrão
dayjs.locale('pt-br');

export default dayjs;
```

### [Helper de Formatação]()

```typescript
// src/utils/date.utils.ts
import dayjs from '@/config/dayjs.config';

// Detectar timezone do navegador
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Formatar data UTC para timezone do usuário
export const formatToUserTimezone = (
  utcDate: string | Date,
  format: string = 'DD/MM/YYYY HH:mm'
): string => {
  const timezone = getUserTimezone();
  return dayjs.utc(utcDate).tz(timezone).format(format);
};

// Formatar data relativa
export const formatRelative = (utcDate: string | Date): string => {
  const timezone = getUserTimezone();
  return dayjs.utc(utcDate).tz(timezone).fromNow();
};

// Converter data local do usuário para UTC (para enviar ao backend)
export const convertToUTC = (localDate: Date | string): string => {
  const timezone = getUserTimezone();
  return dayjs.tz(localDate, timezone).utc().toISOString();
};

// Validar se data está no formato ISO válido
export const isValidISODate = (date: string): boolean => {
  return dayjs(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ', true).isValid();
};
```

### [Componente de Exibição de Data]()

```typescript
// src/components/common/DateDisplay.tsx
import React from 'react';
import { formatToUserTimezone, formatRelative } from '@/utils/date.utils';

interface DateDisplayProps {
  date: string | Date;
  format?: string;
  showRelative?: boolean;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format = 'DD/MM/YYYY HH:mm',
  showRelative = false
}) => {
  if (!date) return null;

  const formatted = formatToUserTimezone(date, format);
  const relative = showRelative ? formatRelative(date) : null;

  return (
    <div>
      <span>{formatted}</span>
      {relative && (
        <span className="text-gray-500 text-sm ml-2">
          ({relative})
        </span>
      )}
    </div>
  );
};
```

### [Formulário - Input de Data]()

```typescript
// src/components/EventoForm.tsx
import React, { useState } from 'react';
import { convertToUTC } from '@/utils/date.utils';
import api from '@/config/axios.config';

export const EventoForm: React.FC = () => {
  const [dataEvento, setDataEvento] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Converter datas locais para UTC antes de enviar
    const payload = {
      data_evento: convertToUTC(dataEvento),
      data_inicio: convertToUTC(dataInicio),
      data_fim: dataFim ? convertToUTC(dataFim) : null,
    };

    try {
      await api.post('/api/eventos', payload);
      alert('Evento criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Data do Evento
        </label>
        <input
          type="datetime-local"
          value={dataEvento}
          onChange={(e) => setDataEvento(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Data de Início
        </label>
        <input
          type="datetime-local"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Data de Término (opcional)
        </label>
        <input
          type="datetime-local"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Criar Evento
      </button>
    </form>
  );
};
```

### [Lista de Eventos]()

```typescript
// src/components/EventosList.tsx
import React, { useEffect, useState } from 'react';
import { DateDisplay } from '@/components/common/DateDisplay';
import api from '@/config/axios.config';

interface Evento {
  id: string;
  data_evento: string;
  data_inicio: string;
  data_fim: string | null;
  created_at: string;
}

export const EventosList: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    const fetchEventos = async () => {
      const response = await api.get('/api/eventos/proximos');
      setEventos(response.data);
    };

    fetchEventos();
  }, []);

  return (
    <div className="space-y-4">
      {eventos.map((evento) => (
        <div key={evento.id} className="border rounded p-4">
          <h3 className="font-bold mb-2">Evento</h3>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Data do Evento:</span>
              <DateDisplay
                date={evento.data_evento}
                format="DD/MM/YYYY HH:mm"
                showRelative
              />
            </div>

            <div>
              <span className="font-medium">Início:</span>
              <DateDisplay date={evento.data_inicio} />
            </div>

            {evento.data_fim && (
              <div>
                <span className="font-medium">Término:</span>
                <DateDisplay date={evento.data_fim} />
              </div>
            )}

            <div>
              <span className="font-medium">Criado em:</span>
              <DateDisplay
                date={evento.created_at}
                format="DD/MM/YYYY"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### [Operações Comuns com dayjs (Frontend)]()

```typescript
import dayjs from '@/config/dayjs.config';
import { getUserTimezone } from '@/utils/date.utils';

const timezone = getUserTimezone();

// Parse de data UTC e conversão para timezone do usuário
const dataUtc = '2025-11-02T14:30:00Z';
const dataLocal = dayjs.utc(dataUtc).tz(timezone);

// Formatação para exibição
const formatadoPtBr = dataLocal.format('DD/MM/YYYY HH:mm');
const formatadoCompleto = dataLocal.format('dddd, D [de] MMMM [de] YYYY [às] HH:mm');

// Data relativa
const relativa = dataLocal.fromNow(); // "há 2 horas", "em 3 dias"

// Converter data local para UTC (para enviar ao backend)
const dataLocalInput = '2025-11-02 14:30';
const dataUtcParaBackend = dayjs.tz(dataLocalInput, timezone).utc().toISOString();
```

## [✅ Checklist de Implementação]()

Lista de verificação completa para garantir que o tratamento de datas está correto em todas as camadas da aplicação.

### [Backend]()

- [ ] Usar `{ type: 'timestamptz' }` nas entities TypeORM
- [ ] Usar `TIMESTAMPTZ` nas migrations SQL
- [ ] Instalar dayjs e plugin utc
- [ ] Sempre usar `dayjs.utc()` para manipulações
- [ ] Validar DTOs com `@IsISO8601()`
- [ ] Converter strings ISO para Date antes de salvar
- [ ] Documentar formato esperado no Swagger
- [ ] Retornar datas em formato ISO UTC nas respostas

### [Frontend]()

- [ ] Instalar dayjs com plugins utc, timezone, relativeTime
- [ ] Configurar locale para pt-br
- [ ] Criar helper de conversão UTC ↔ Local
- [ ] Criar componente DateDisplay reutilizável
- [ ] Usar `datetime-local` em inputs
- [ ] Converter para UTC antes de enviar ao backend
- [ ] Converter para timezone local ao exibir
- [ ] Mostrar datas relativas quando apropriado

## [🚨 Erros Comuns]()

Erros frequentes no tratamento de datas e as formas corretas de implementação.

### [❌ Não Fazer]()

```typescript
// Backend - NÃO usar new Date() diretamente
const agora = new Date(); // Pode ter timezone local do servidor

// Backend - NÃO salvar string no banco
await this.repository.save({
  data_evento: createDto.data_evento, // String ao invés de Date
});

// Frontend - NÃO enviar Date object
await api.post('/api/eventos', {
  data_evento: new Date(), // Enviar ISO string em UTC
});

// Frontend - NÃO exibir data UTC diretamente
<span>{evento.data_evento}</span> // Vai mostrar hora errada
```

### [✅ Fazer]()

```typescript
// Backend - Usar dayjs.utc()
const agora = dayjs.utc().toDate();

// Backend - Converter para Date
await this.repository.save({
  data_evento: dayjs.utc(createDto.data_evento).toDate(),
});

// Frontend - Enviar ISO string em UTC
await api.post('/api/eventos', {
  data_evento: convertToUTC(dataLocal),
});

// Frontend - Exibir com conversão
<DateDisplay date={evento.data_evento} />
```

## [📖 Resumo do Fluxo]()

Fluxo completo end-to-end mostrando como as datas são tratadas desde a entrada do usuário até a exibição final.

### [Criar um Evento]()

1. **Frontend**: Usuário seleciona `02/11/2025 14:30` (GMT-3)
2. **Frontend**: Converte para UTC: `2025-11-02T17:30:00Z`
3. **Frontend**: Envia JSON com string ISO UTC
4. **Backend**: Recebe string ISO UTC
5. **Backend**: Valida com `@IsISO8601()`
6. **Backend**: Converte para Date: `dayjs.utc().toDate()`
7. **PostgreSQL**: Armazena em UTC
8. **Backend**: Retorna JSON com string ISO UTC
9. **Frontend**: Recebe string ISO UTC
10. **Frontend**: Converte para GMT-3 e exibe: `02/11/2025 14:30`

### [Consultar Eventos]()

1. **PostgreSQL**: Retorna Date em UTC
2. **TypeORM**: Converte para Date object
3. **Backend**: Retorna JSON (Date vira string ISO UTC automaticamente)
4. **Frontend**: Recebe string ISO UTC
5. **Frontend**: Converte para timezone do usuário
6. **Frontend**: Exibe formatado

## [🔗 Referências]()

- [dayjs Documentation](https://day.js.org/docs/en/installation/installation)
- [dayjs UTC Plugin](https://day.js.org/docs/en/plugin/utc)
- [dayjs Timezone Plugin](https://day.js.org/docs/en/plugin/timezone)
- [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [ISO 8601 Format](https://en.wikipedia.org/wiki/ISO_8601)

---

**Última atualização**: 2 de novembro de 2025
