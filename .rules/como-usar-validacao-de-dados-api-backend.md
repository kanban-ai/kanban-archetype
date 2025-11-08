# [Como usar validação de dados na API?]()

> Guia completo sobre validação de dados usando class-validator no NestJS.

## [Visão Geral - Validação de dados com class-validator no NestJS]()

Esta seção introduz o sistema de validação automática do projeto usando class-validator e class-transformer, explicando como DTOs garantem integridade dos dados.

O projeto usa class-validator para validar automaticamente dados de requisições HTTP através de DTOs:

O projeto usa **class-validator** para validar automaticamente todos os dados recebidos nas requisições HTTP através de DTOs (Data Transfer Objects).

## [Configuração Global do ValidationPipe no NestJS]()

Configuração do ValidationPipe no main.ts para validação automática em toda aplicação:

### [ValidationPipe no main.ts]()

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                    // Remove props não declaradas
      forbidNonWhitelisted: true,         // Erro se props extras
      transform: true,                    // Transforma tipos automaticamente
      transformOptions: {
        enableImplicitConversion: false,  // Não converte tipos implicitamente
      },
    }),
  );

  await app.listen(3000);
}
```

### [O que cada opção faz:]()

- **whitelist**: Remove campos não definidos no DTO
- **forbidNonWhitelisted**: Retorna erro 400 se enviar campos extras
- **transform**: Converte query params e params para o tipo correto
- **enableImplicitConversion**: false para evitar conversões estranhas

## [Validadores Disponíveis no class-validator para DTOs]()

Lista completa de decorators de validação do class-validator:

### [Validadores de String]()

```typescript
import {
  IsString,
  IsNotEmpty,
  IsEmpty,
  MinLength,
  MaxLength,
  Length,
  Matches,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class ExampleDto {
  @IsString()
  name: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  username: string;

  @Length(11, 11) // Exatamente 11 caracteres
  cpf: string;

  @IsEmail()
  email: string;

  @IsUrl()
  website: string;

  @Matches(/^[0-9]+$/, { message: 'Apenas números' })
  phone: string;
}
```

### [Validadores Numéricos]()

```typescript
import {
  IsNumber,
  IsInt,
  Min,
  Max,
  IsPositive,
  IsNegative,
  IsDivisibleBy,
} from 'class-validator';

export class ExampleDto {
  @IsNumber()
  price: number;

  @IsInt()
  quantity: number;

  @Min(0)
  @Max(100)
  discount: number;

  @IsPositive()
  value: number;

  @IsDivisibleBy(5)
  multiple: number;
}
```

### [Validadores Booleanos]()

```typescript
import { IsBoolean } from 'class-validator';

export class ExampleDto {
  @IsBoolean()
  active: boolean;

  @IsBoolean()
  verified: boolean;
}
```

### [Validadores de Data]()

```typescript
import { IsDate, MinDate, MaxDate } from 'class-validator';

export class ExampleDto {
  @IsDate()
  birthDate: Date;

  @MinDate(new Date('2024-01-01'))
  startDate: Date;

  @MaxDate(new Date())
  endDate: Date;
}
```

### [Validadores de Array]()

```typescript
import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class ExampleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  tags: string[];

  @IsArray()
  @IsString({ each: true }) // Cada item deve ser string
  categories: string[];
}
```

### [Validadores de Enum]()

```typescript
import { IsEnum } from 'class-validator';

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export class ExampleDto {
  @IsEnum(Status)
  status: Status;
}
```

### [Campos Opcionais]()

```typescript
import { IsOptional, IsString } from 'class-validator';

export class ExampleDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Obrigatório

  @IsString()
  @IsOptional() // Pode ser undefined
  description?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty() // Se fornecido, não pode ser vazio
  notes?: string;
}
```

## [Exemplo Completo de Create DTO com validação]()

DTO completo com todas validações e documentação Swagger:

```typescript
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Notebook Dell',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada',
    example: 'Notebook Dell Inspiron 15',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Preço em reais',
    example: 2500.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Quantidade em estoque',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'Se o produto está ativo',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
```

## [Validação em Objetos Aninhados com @ValidateNested]()

Para validar DTOs aninhados, utilize o decorator `@ValidateNested()` combinado com `@Type()` do class-transformer para garantir que objetos complexos sejam validados recursivamente.

Como validar DTOs aninhados usando class-validator:

### [DTO Aninhado]()

```typescript
import { ValidateNested, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested() // Valida objeto aninhado
  @Type(() => AddressDto) // Transforma para classe
  address: AddressDto;
}
```

## [Validação Customizada com decorators próprios]()

Criar validadores personalizados para regras de negócio específicas:

### [Decorator Customizado]()

```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCPF', async: false })
export class IsCPFConstraint implements ValidatorConstraintInterface {
  validate(cpf: string, args: ValidationArguments) {
    // Lógica de validação de CPF
    return /^[0-9]{11}$/.test(cpf);
  }

  defaultMessage(args: ValidationArguments) {
    return 'CPF inválido';
  }
}

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCPFConstraint,
    });
  };
}

// Uso
export class CreateUserDto {
  @IsCPF({ message: 'CPF informado é inválido' })
  cpf: string;
}
```

## [Mensagens de Erro Customizadas nos validadores]()

Personalizar mensagens de erro para melhor UX no frontend:

```typescript
export class CreateProductDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @IsNumber({}, { message: 'Preço deve ser um número' })
  @Min(0, { message: 'Preço não pode ser negativo' })
  price: number;
}
```

## [Validação Condicional com @ValidateIf]()

O decorator `@ValidateIf()` permite aplicar validações condicionalmente baseado em valores de outros campos do DTO, útil para cenários onde a obrigatoriedade de um campo depende de outro.

Validar campos condicionalmente baseado em outros campos:

```typescript
import { ValidateIf } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  paymentMethod: string;

  // Só valida se paymentMethod === 'credit_card'
  @ValidateIf(o => o.paymentMethod === 'credit_card')
  @IsString()
  @IsNotEmpty()
  cardNumber?: string;

  @ValidateIf(o => o.paymentMethod === 'credit_card')
  @IsString()
  @IsNotEmpty()
  cardHolderName?: string;
}
```

## [Transformação de Tipos com @Type e @Transform]()

Utilize `@Type()` e `@Transform()` do class-transformer para converter automaticamente tipos de dados (ex: string para number, string para Date), essencial quando recebendo dados de query params ou formulários.

Converter automaticamente tipos de dados (string para number, etc):

### [Com @Type()]()

```typescript
import { Type } from 'class-transformer';

export class QueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number;

  @Type(() => Boolean)
  @IsBoolean()
  active: boolean;
}
```

### [Com @Transform()]()

```typescript
import { Transform } from 'class-transformer';

export class QueryDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  page: number;

  @Transform(({ value }) => value.toLowerCase())
  @IsString()
  search: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  active: boolean;
}
```

## [Validação de Arrays e cada elemento]()

Validar arrays e seus elementos com class-validator:

### [Array de Strings]()

```typescript
export class CreateProductDto {
  @IsArray()
  @IsString({ each: true }) // Valida cada item
  @ArrayMinSize(1, { message: 'Pelo menos uma tag é necessária' })
  tags: string[];
}
```

### [Array de Objetos]()

```typescript
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  @ArrayMinSize(1)
  items: ItemDto[];
}
```

## [Tratamento de Erros de validação no NestJS]()

Como o NestJS retorna erros de validação e como customizar:

### [Estrutura da Resposta de Erro]()

Quando a validação falha, o NestJS retorna automaticamente:

```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "price must not be less than 0",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

### [Capturar Erros de Validação]()

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // Customizar resposta
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      errors: exceptionResponse.message,
    });
  }
}
```

## [Validação Manual sem DTO usando class-validator]()

Validar objetos manualmente sem usar ValidationPipe:

Se precisar validar manualmente:

```typescript
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

async function validateData() {
  const dto = plainToClass(CreateProductDto, {
    name: 'Produto',
    price: -10, // Inválido
  });

  const errors = await validate(dto);

  if (errors.length > 0) {
    console.log('Erros de validação:', errors);
  }
}
```

## [Boas Práticas ao usar validação no NestJS]()

Recomendações essenciais para validação robusta e segura:

1. **Sempre use DTOs**: Nunca aceite `any` no controller
2. **Validação no backend**: Nunca confie apenas no frontend
3. **Mensagens claras**: Ajude o frontend a exibir erros
4. **@IsOptional para campos opcionais**: Seja explícito
5. **Valide antes de processar**: Deixe o ValidationPipe fazer o trabalho
6. **Use @Type() para conversão**: Garanta tipos corretos
7. **Documente com @ApiProperty**: Integre com Swagger

## [Checklist de Validação de DTOs]()

Lista de verificação para cada DTO criado:

Para cada DTO:
- [ ] Validadores em todos os campos obrigatórios
- [ ] @IsOptional nos campos opcionais
- [ ] Min/Max para números e strings
- [ ] Validação de formato (email, URL, etc)
- [ ] @ApiProperty para documentação Swagger
- [ ] Mensagens de erro customizadas (se necessário)
- [ ] Transformação de tipos (se necessário)

## [Referências e documentação oficial sobre validação]()

Links para class-validator, class-transformer e NestJS validation:

- [class-validator Documentation](https://github.com/typestack/class-validator)
- [class-transformer Documentation](https://github.com/typestack/class-transformer)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
