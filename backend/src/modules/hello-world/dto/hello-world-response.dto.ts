import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HelloWorldResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Title of the hello world item',
    example: 'My First Hello World',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the hello world item',
    example: 'This is a detailed description',
  })
  description: string;

  @ApiProperty({
    description: 'Whether the item is active',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-12-16T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-12-16T10:00:00.000Z',
  })
  updatedAt: Date;
}
