# How to Handle Dates - Backend and Frontend

> Complete guide on correct date handling in backend and frontend, using ISODate UTC in the database and dayjs for manipulation.

## [📋 Fundamental Principles]()

Essential concepts for correct date handling in distributed systems, ensuring consistency between database, backend and frontend.

### [Golden Rule]()

1. **Database**: Always store in **ISODate UTC** (GMT-0)
2. **Backend**: Always manipulate in **UTC** (GMT-0)
3. **Frontend**: Transform to user's GMT **only for display**

### [Why UTC?]()

- Avoids daylight saving time problems
- Facilitates synchronization between servers in different regions
- Eliminates ambiguity in distributed systems
- Simplifies date calculations and comparisons

## [🗄️ Database - PostgreSQL]()

Column type configuration and migrations for correct UTC date storage in PostgreSQL.

### [Column Type]()

```typescript
@Entity('events')
export class Event extends SuperEntity {
  @Column({ type: 'timestamptz' })
  event_date: Date;

  @Column({ type: 'timestamptz' })
  start_date: Date;

  @Column({ type: 'timestamptz', nullable: true })
  end_date: Date;
}
```

**Important**: Use `timestamptz` instead of `timestamp with time zone` to ensure TypeORM always works with UTC.

### [Migration]()

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "event_date" TIMESTAMPTZ NOT NULL,
        "start_date" TIMESTAMPTZ NOT NULL,
        "end_date" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_events" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "events";`);
  }
}
```

**Important**: Use `TIMESTAMPTZ` in SQL migrations. It's the abbreviation for `TIMESTAMP WITH TIME ZONE` and ensures UTC storage.

### [PostgreSQL Notes]()

- `TIMESTAMPTZ` is the abbreviation for `TIMESTAMP WITH TIME ZONE`
- Always stores in UTC internally
- PostgreSQL automatically converts to UTC when inserting
- When querying, PostgreSQL can convert to connection timezone
- **Use `timestamptz` in TypeORM entities and `TIMESTAMPTZ` in SQL migrations**

## [🔧 Backend - NestJS]()

Implementation of UTC date manipulation using dayjs in the backend, including DTO validation and service operations.

### [dayjs Installation]()

```bash
npm install dayjs
```

### [dayjs Configuration]()

Create a configuration file (optional):

```typescript
// src/config/dayjs.config.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Load plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;
```

### [DTO - Receive Date from Frontend]()

```typescript
import { IsISO8601, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    example: '2025-11-02T14:30:00Z',
    description: 'Event date and time in ISO 8601 UTC format'
  })
  @IsISO8601()
  event_date: string;

  @ApiProperty({
    example: '2025-11-02T09:00:00Z',
    description: 'Start date and time in ISO 8601 UTC format'
  })
  @IsISO8601()
  start_date: string;

  @ApiProperty({
    example: '2025-11-02T18:00:00Z',
    description: 'End date and time in ISO 8601 UTC format',
    required: false
  })
  @IsISO8601()
  @IsOptional()
  end_date?: string;
}
```

### [Service - Date Manipulation]()

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';

dayjs.extend(utc);

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    // Convert ISO string to UTC Date
    const event = this.eventRepository.create({
      ...createEventDto,
      event_date: dayjs.utc(createEventDto.event_date).toDate(),
      start_date: dayjs.utc(createEventDto.start_date).toDate(),
      end_date: createEventDto.end_date
        ? dayjs.utc(createEventDto.end_date).toDate()
        : null,
    });

    return await this.eventRepository.save(event);
  }

  async findEventsBetweenDates(startDate: string, endDate: string) {
    // Always work in UTC
    const start = dayjs.utc(startDate).toDate();
    const end = dayjs.utc(endDate).toDate();

    return await this.eventRepository
      .createQueryBuilder('event')
      .where('event.event_date >= :start', { start })
      .andWhere('event.event_date <= :end', { end })
      .getMany();
  }

  async findEventsNext7Days() {
    // Calculate 7 days from now in UTC
    const now = dayjs.utc();
    const in7Days = now.add(7, 'day');

    return await this.eventRepository
      .createQueryBuilder('event')
      .where('event.event_date >= :now', { now: now.toDate() })
      .andWhere('event.event_date <= :limit', { limit: in7Days.toDate() })
      .orderBy('event.event_date', 'ASC')
      .getMany();
  }

  async calculateEventDuration(eventId: string) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId }
    });

    if (!event || !event.end_date) {
      return null;
    }

    // Calculate difference in UTC
    const start = dayjs.utc(event.start_date);
    const end = dayjs.utc(event.end_date);

    return {
      hours: end.diff(start, 'hour'),
      minutes: end.diff(start, 'minute'),
      days: end.diff(start, 'day'),
    };
  }
}
```

### [Controller - Return Dates]()

```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new event' })
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.create(createEventDto);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'List events for the next 7 days' })
  async findUpcoming() {
    return await this.eventsService.findEventsNext7Days();
  }

  @Get('between-dates')
  @ApiOperation({ summary: 'Find events between dates' })
  async findBetweenDates(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return await this.eventsService.findEventsBetweenDates(start, end);
  }

  @Get(':id/duration')
  @ApiOperation({ summary: 'Calculate event duration' })
  async calculateDuration(@Param('id') id: string) {
    return await this.eventsService.calculateEventDuration(id);
  }
}
```

### [Common Operations with dayjs (Backend)]()

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Always use .utc() to work in UTC
const now = dayjs.utc(); // Current date/time in UTC
const date = dayjs.utc('2025-11-02T14:30:00Z'); // Parse in UTC

// Add/Subtract time
const future = dayjs.utc().add(7, 'day');
const past = dayjs.utc().subtract(1, 'month');

// Formatting (only for logs, not for user display)
const formatted = dayjs.utc().format('YYYY-MM-DD HH:mm:ss');

// Comparisons
const isAfter = dayjs.utc(date1).isAfter(dayjs.utc(date2));
const isBefore = dayjs.utc(date1).isBefore(dayjs.utc(date2));
const isSame = dayjs.utc(date1).isSame(dayjs.utc(date2));

// Differences
const diffDays = dayjs.utc(date2).diff(dayjs.utc(date1), 'day');
const diffHours = dayjs.utc(date2).diff(dayjs.utc(date1), 'hour');

// Start/End of periods
const startOfDay = dayjs.utc().startOf('day');
const endOfMonth = dayjs.utc().endOf('month');

// Convert to Date (to save in database)
const dateObject = dayjs.utc().toDate();
```

## [🎨 Frontend - React]()

Converting UTC dates to user timezone, formatting for display and submitting forms with dates.

### [dayjs Installation]()

```bash
npm install dayjs
```

### [dayjs Configuration]()

```typescript
// src/config/dayjs.config.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

// Load plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Configure default locale
dayjs.locale('pt-br');

export default dayjs;
```

### [Formatting Helper]()

```typescript
// src/utils/date.utils.ts
import dayjs from '@/config/dayjs.config';

// Detect browser timezone
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Format UTC date to user timezone
export const formatToUserTimezone = (
  utcDate: string | Date,
  format: string = 'DD/MM/YYYY HH:mm'
): string => {
  const timezone = getUserTimezone();
  return dayjs.utc(utcDate).tz(timezone).format(format);
};

// Format relative date
export const formatRelative = (utcDate: string | Date): string => {
  const timezone = getUserTimezone();
  return dayjs.utc(utcDate).tz(timezone).fromNow();
};

// Convert user's local date to UTC (to send to backend)
export const convertToUTC = (localDate: Date | string): string => {
  const timezone = getUserTimezone();
  return dayjs.tz(localDate, timezone).utc().toISOString();
};

// Validate if date is in valid ISO format
export const isValidISODate = (date: string): boolean => {
  return dayjs(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ', true).isValid();
};
```

### [Date Display Component]()

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

### [Form - Date Input]()

```typescript
// src/components/EventForm.tsx
import React, { useState } from 'react';
import { convertToUTC } from '@/utils/date.utils';
import api from '@/config/axios.config';

export const EventForm: React.FC = () => {
  const [eventDate, setEventDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert local dates to UTC before sending
    const payload = {
      event_date: convertToUTC(eventDate),
      start_date: convertToUTC(startDate),
      end_date: endDate ? convertToUTC(endDate) : null,
    };

    try {
      await api.post('/api/events', payload);
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Event Date
        </label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Start Date
        </label>
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          End Date (optional)
        </label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create Event
      </button>
    </form>
  );
};
```

### [Events List]()

```typescript
// src/components/EventsList.tsx
import React, { useEffect, useState } from 'react';
import { DateDisplay } from '@/components/common/DateDisplay';
import api from '@/config/axios.config';

interface Event {
  id: string;
  event_date: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await api.get('/api/events/upcoming');
      setEvents(response.data);
    };

    fetchEvents();
  }, []);

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="border rounded p-4">
          <h3 className="font-bold mb-2">Event</h3>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Event Date:</span>
              <DateDisplay
                date={event.event_date}
                format="DD/MM/YYYY HH:mm"
                showRelative
              />
            </div>

            <div>
              <span className="font-medium">Start:</span>
              <DateDisplay date={event.start_date} />
            </div>

            {event.end_date && (
              <div>
                <span className="font-medium">End:</span>
                <DateDisplay date={event.end_date} />
              </div>
            )}

            <div>
              <span className="font-medium">Created:</span>
              <DateDisplay
                date={event.created_at}
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

### [Common Operations with dayjs (Frontend)]()

```typescript
import dayjs from '@/config/dayjs.config';
import { getUserTimezone } from '@/utils/date.utils';

const timezone = getUserTimezone();

// Parse UTC date and convert to user timezone
const utcDate = '2025-11-02T14:30:00Z';
const localDate = dayjs.utc(utcDate).tz(timezone);

// Formatting for display
const formattedPtBr = localDate.format('DD/MM/YYYY HH:mm');
const formattedComplete = localDate.format('dddd, D [de] MMMM [de] YYYY [às] HH:mm');

// Relative date
const relative = localDate.fromNow(); // "2 hours ago", "in 3 days"

// Convert local date to UTC (to send to backend)
const localDateInput = '2025-11-02 14:30';
const utcDateForBackend = dayjs.tz(localDateInput, timezone).utc().toISOString();
```

## [✅ Implementation Checklist]()

Complete verification checklist to ensure date handling is correct across all application layers.

### [Backend]()

- [ ] Use `{ type: 'timestamptz' }` in TypeORM entities
- [ ] Use `TIMESTAMPTZ` in SQL migrations
- [ ] Install dayjs and utc plugin
- [ ] Always use `dayjs.utc()` for manipulations
- [ ] Validate DTOs with `@IsISO8601()`
- [ ] Convert ISO strings to Date before saving
- [ ] Document expected format in Swagger
- [ ] Return dates in ISO UTC format in responses

### [Frontend]()

- [ ] Install dayjs with utc, timezone, relativeTime plugins
- [ ] Configure locale to pt-br
- [ ] Create UTC ↔ Local conversion helper
- [ ] Create reusable DateDisplay component
- [ ] Use `datetime-local` in inputs
- [ ] Convert to UTC before sending to backend
- [ ] Convert to local timezone when displaying
- [ ] Show relative dates when appropriate

## [🚨 Common Errors]()

Frequent errors in date handling and the correct implementation forms.

### [❌ Don't Do]()

```typescript
// Backend - DON'T use new Date() directly
const now = new Date(); // May have server local timezone

// Backend - DON'T save string in database
await this.repository.save({
  event_date: createDto.event_date, // String instead of Date
});

// Frontend - DON'T send Date object
await api.post('/api/events', {
  event_date: new Date(), // Send ISO string in UTC
});

// Frontend - DON'T display UTC date directly
<span>{event.event_date}</span> // Will show wrong time
```

### [✅ Do]()

```typescript
// Backend - Use dayjs.utc()
const now = dayjs.utc().toDate();

// Backend - Convert to Date
await this.repository.save({
  event_date: dayjs.utc(createDto.event_date).toDate(),
});

// Frontend - Send ISO string in UTC
await api.post('/api/events', {
  event_date: convertToUTC(localDate),
});

// Frontend - Display with conversion
<DateDisplay date={event.event_date} />
```

## [📖 Flow Summary]()

Complete end-to-end flow showing how dates are handled from user input to final display.

### [Create an Event]()

1. **Frontend**: User selects `11/02/2025 14:30` (GMT-3)
2. **Frontend**: Converts to UTC: `2025-11-02T17:30:00Z`
3. **Frontend**: Sends JSON with ISO UTC string
4. **Backend**: Receives ISO UTC string
5. **Backend**: Validates with `@IsISO8601()`
6. **Backend**: Converts to Date: `dayjs.utc().toDate()`
7. **PostgreSQL**: Stores in UTC
8. **Backend**: Returns JSON with ISO UTC string
9. **Frontend**: Receives ISO UTC string
10. **Frontend**: Converts to GMT-3 and displays: `11/02/2025 14:30`

### [Query Events]()

1. **PostgreSQL**: Returns Date in UTC
2. **TypeORM**: Converts to Date object
3. **Backend**: Returns JSON (Date becomes ISO UTC string automatically)
4. **Frontend**: Receives ISO UTC string
5. **Frontend**: Converts to user timezone
6. **Frontend**: Displays formatted

## [🔗 References]()

- [dayjs Documentation](https://day.js.org/docs/en/installation/installation)
- [dayjs UTC Plugin](https://day.js.org/docs/en/plugin/utc)
- [dayjs Timezone Plugin](https://day.js.org/docs/en/plugin/timezone)
- [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [ISO 8601 Format](https://en.wikipedia.org/wiki/ISO_8601)

---

**Last updated**: November 2, 2025
