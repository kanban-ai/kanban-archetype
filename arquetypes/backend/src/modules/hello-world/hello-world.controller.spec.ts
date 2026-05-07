import { Test, TestingModule } from '@nestjs/testing';
import { HelloWorldController } from './hello-world.controller';
import {
  CreateHelloWorldUseCaseImpl,
  UpdateHelloWorldUseCaseImpl,
  DeleteHelloWorldUseCaseImpl,
  FindAllHelloWorldUseCaseImpl,
  FindOneHelloWorldUseCaseImpl,
} from './use-cases';
import { CreateHelloWorldDto, UpdateHelloWorldDto } from './dto';

describe('HelloWorldController', () => {
  let controller: HelloWorldController;

  const mockEntity = {
    id: 1,
    title: 'Test Title',
    description: 'Test Description',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockCreateUseCase = { execute: jest.fn() };
  const mockUpdateUseCase = { execute: jest.fn() };
  const mockDeleteUseCase = { execute: jest.fn() };
  const mockFindAllUseCase = { execute: jest.fn() };
  const mockFindOneUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelloWorldController],
      providers: [
        { provide: CreateHelloWorldUseCaseImpl, useValue: mockCreateUseCase },
        { provide: UpdateHelloWorldUseCaseImpl, useValue: mockUpdateUseCase },
        { provide: DeleteHelloWorldUseCaseImpl, useValue: mockDeleteUseCase },
        { provide: FindAllHelloWorldUseCaseImpl, useValue: mockFindAllUseCase },
        { provide: FindOneHelloWorldUseCaseImpl, useValue: mockFindOneUseCase },
      ],
    }).compile();

    controller = module.get<HelloWorldController>(HelloWorldController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new hello world item', async () => {
      const createDto: CreateHelloWorldDto = {
        title: 'Test Title',
        description: 'Test Description',
        active: true,
      };

      mockCreateUseCase.execute.mockResolvedValue(mockEntity);

      const result = await controller.create(createDto);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of hello world items', async () => {
      const entities = [mockEntity];
      mockFindAllUseCase.execute.mockResolvedValue(entities);

      const result = await controller.findAll();

      expect(mockFindAllUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(entities);
    });
  });

  describe('findOne', () => {
    it('should return a hello world item by id', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(mockEntity);

      const result = await controller.findOne(mockEntity.id);

      expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(mockEntity.id);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('update', () => {
    it('should update a hello world item', async () => {
      const updateDto: UpdateHelloWorldDto = {
        title: 'Updated Title',
      };
      const updatedEntity = { ...mockEntity, ...updateDto };

      mockUpdateUseCase.execute.mockResolvedValue(updatedEntity);

      const result = await controller.update(mockEntity.id, updateDto);

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(mockEntity.id, updateDto);
      expect(result.title).toBe(updateDto.title);
    });
  });

  describe('remove', () => {
    it('should remove a hello world item', async () => {
      mockDeleteUseCase.execute.mockResolvedValue(undefined);

      await controller.remove(mockEntity.id);

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith(mockEntity.id);
    });
  });
});
