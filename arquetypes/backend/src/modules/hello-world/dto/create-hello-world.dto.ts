import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateHelloWorldDto {
  @ApiProperty({
    description: 'Title of the hello world item',
    example: 'My First Hello World',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the hello world item',
    example: 'This is a detailed description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the item is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
