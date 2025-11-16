# [How to use data validation in the API?]()

> Complete guide on data validation using class-validator in NestJS.

## [Overview - Data validation with class-validator in NestJS]()

This section introduces the project's automatic validation system using class-validator and class-transformer, explaining how DTOs ensure data integrity.

The project uses class-validator to automatically validate data from HTTP requests through DTOs:

The project uses **class-validator** to automatically validate all data received in HTTP requests through DTOs (Data Transfer Objects).

## [Global ValidationPipe Configuration in NestJS]()

ValidationPipe configuration in main.ts for automatic validation throughout the application:

### [ValidationPipe in main.ts]()

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,                    // Remove undeclared properties
      forbidNonWhitelisted: true,         // Error if extra properties
      transform: true,                    // Transform types automatically
      transformOptions: {
        enableImplicitConversion: false,  // Don't convert types implicitly
      },
    }),
  );

  await app.listen(3000);
}
```

### [What each option does:]()

- **whitelist**: Removes fields not defined in the DTO
- **forbidNonWhitelisted**: Returns 400 error if extra fields are sent
- **transform**: Converts query params and params to the correct type
- **enableImplicitConversion**: false to avoid unexpected conversions

## [Available class-validator Validators for DTOs]()

Complete list of class-validator validation decorators:

### [String Validators]()

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

  @Length(11, 11) // Exactly 11 characters
  cpf: string;

  @IsEmail()
  email: string;

  @IsUrl()
  website: string;

  @Matches(/^[0-9]+$/, { message: 'Numbers only' })
  phone: string;
}
```

### [Numeric Validators]()

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

### [Boolean Validators]()

```typescript
import { IsBoolean } from 'class-validator';

export class ExampleDto {
  @IsBoolean()
  active: boolean;

  @IsBoolean()
  verified: boolean;
}
```

### [Date Validators]()

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

### [Array Validators]()

```typescript
import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class ExampleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  tags: string[];

  @IsArray()
  @IsString({ each: true }) // Each item must be a string
  categories: string[];
}
```

### [Enum Validators]()

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

### [Optional Fields]()

```typescript
import { IsOptional, IsString } from 'class-validator';

export class ExampleDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Required

  @IsString()
  @IsOptional() // Can be undefined
  description?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty() // If provided, cannot be empty
  notes?: string;
}
```

## [Complete Create DTO Example with validation]()

Complete DTO with all validations and Swagger documentation:

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
    description: 'Product name',
    example: 'Dell Notebook',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description',
    example: 'Dell Inspiron 15 Notebook',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Price in reais',
    example: 2500.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
```

## [Nested Object Validation with @ValidateNested]()

To validate nested DTOs, use the `@ValidateNested()` decorator combined with `@Type()` from class-transformer to ensure complex objects are validated recursively.

How to validate nested DTOs using class-validator:

### [Nested DTO]()

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

  @ValidateNested() // Validates nested object
  @Type(() => AddressDto) // Transforms to class
  address: AddressDto;
}
```

## [Custom Validation with custom decorators]()

Create custom validators for specific business rules:

### [Custom Decorator]()

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
    // CPF validation logic
    return /^[0-9]{11}$/.test(cpf);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid CPF';
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

// Usage
export class CreateUserDto {
  @IsCPF({ message: 'The CPF provided is invalid' })
  cpf: string;
}
```

## [Custom Error Messages in validators]()

Customize error messages for better frontend UX:

```typescript
export class CreateProductDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  name: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;
}
```

## [Conditional Validation with @ValidateIf]()

The `@ValidateIf()` decorator allows applying validations conditionally based on other DTO field values, useful for scenarios where field requirement depends on another field.

Validate fields conditionally based on other fields:

```typescript
import { ValidateIf } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  paymentMethod: string;

  // Only validates if paymentMethod === 'credit_card'
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

## [Type Transformation with @Type and @Transform]()

Use `@Type()` and `@Transform()` from class-transformer to automatically convert data types (e.g., string to number, string to Date), essential when receiving data from query params or forms.

Automatically convert data types (string to number, etc):

### [With @Type()]()

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

### [With @Transform()]()

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

## [Array and Element Validation]()

Validate arrays and their elements with class-validator:

### [Array of Strings]()

```typescript
export class CreateProductDto {
  @IsArray()
  @IsString({ each: true }) // Validates each item
  @ArrayMinSize(1, { message: 'At least one tag is required' })
  tags: string[];
}
```

### [Array of Objects]()

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

## [Validation Error Handling in NestJS]()

How NestJS returns validation errors and how to customize them:

### [Error Response Structure]()

When validation fails, NestJS automatically returns:

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

### [Catch Validation Errors]()

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // Customize response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      errors: exceptionResponse.message,
    });
  }
}
```

## [Manual Validation without DTO using class-validator]()

Validate objects manually without using ValidationPipe:

If you need to validate manually:

```typescript
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

async function validateData() {
  const dto = plainToClass(CreateProductDto, {
    name: 'Product',
    price: -10, // Invalid
  });

  const errors = await validate(dto);

  if (errors.length > 0) {
    console.log('Validation errors:', errors);
  }
}
```

## [Best Practices when using validation in NestJS]()

Essential recommendations for robust and secure validation:

1. **Always use DTOs**: Never accept `any` anywhere in the code (see [typescript-patterns-standards.md](./typescript-patterns-standards.md) for complete typing rules)
2. **Backend validation**: Never trust frontend-only validation
3. **Clear messages**: Help the frontend display errors
4. **@IsOptional for optional fields**: Be explicit
5. **Validate before processing**: Let ValidationPipe do the work
6. **Use @Type() for conversion**: Ensure correct types
7. **Document with @ApiProperty**: Integrate with Swagger

## [DTO Validation Checklist]()

Verification checklist for each created DTO:

For each DTO:
- [ ] Validators on all required fields
- [ ] @IsOptional on optional fields
- [ ] Min/Max for numbers and strings
- [ ] Format validation (email, URL, etc)
- [ ] @ApiProperty for Swagger documentation
- [ ] Custom error messages (if needed)
- [ ] Type transformation (if needed)

## [References and official documentation on validation]()

Links to class-validator, class-transformer and NestJS validation:

- [class-validator Documentation](https://github.com/typestack/class-validator)
- [class-transformer Documentation](https://github.com/typestack/class-transformer)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
