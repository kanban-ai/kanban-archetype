import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateHelloWorldDto,
  UpdateHelloWorldDto,
  HelloWorldResponseDto,
} from './dto';
import {
  CreateHelloWorldUseCaseImpl,
  UpdateHelloWorldUseCaseImpl,
  DeleteHelloWorldUseCaseImpl,
  FindAllHelloWorldUseCaseImpl,
  FindOneHelloWorldUseCaseImpl,
} from './use-cases';

@ApiTags('Hello World')
@Controller({ path: 'hello-world', version: '1' })
export class HelloWorldController {
  constructor(
    private readonly createHelloWorldUseCase: CreateHelloWorldUseCaseImpl,
    private readonly updateHelloWorldUseCase: UpdateHelloWorldUseCaseImpl,
    private readonly deleteHelloWorldUseCase: DeleteHelloWorldUseCaseImpl,
    private readonly findAllHelloWorldUseCase: FindAllHelloWorldUseCaseImpl,
    private readonly findOneHelloWorldUseCase: FindOneHelloWorldUseCaseImpl,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new hello world item' })
  @ApiResponse({
    status: 201,
    description: 'The item has been successfully created.',
    type: HelloWorldResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createDto: CreateHelloWorldDto): Promise<HelloWorldResponseDto> {
    return this.createHelloWorldUseCase.execute(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hello world items' })
  @ApiResponse({
    status: 200,
    description: 'Return all items.',
    type: [HelloWorldResponseDto],
  })
  findAll(): Promise<HelloWorldResponseDto[]> {
    return this.findAllHelloWorldUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hello world item by ID' })
  @ApiParam({ name: 'id', description: 'ID of the item' })
  @ApiResponse({
    status: 200,
    description: 'Return the item.',
    type: HelloWorldResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<HelloWorldResponseDto> {
    return this.findOneHelloWorldUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hello world item' })
  @ApiParam({ name: 'id', description: 'ID of the item' })
  @ApiResponse({
    status: 200,
    description: 'The item has been successfully updated.',
    type: HelloWorldResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHelloWorldDto,
  ): Promise<HelloWorldResponseDto> {
    return this.updateHelloWorldUseCase.execute(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a hello world item' })
  @ApiParam({ name: 'id', description: 'ID of the item' })
  @ApiResponse({ status: 204, description: 'The item has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.deleteHelloWorldUseCase.execute(id);
  }
}
