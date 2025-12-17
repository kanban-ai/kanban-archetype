import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DeleteHelloWorldUseCaseImpl } from './delete-hello-world.use-case';
import { HelloWorldEntity } from '../entities/hello-world.entity';

describe('DeleteHelloWorldUseCase', () => {
  let useCase: DeleteHelloWorldUseCaseImpl;

  const mockEntity: HelloWorldEntity = {
    id: 1,
    title: 'Test Title',
    description: 'Test Description',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockRepository = {
    findOne: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteHelloWorldUseCaseImpl,
        {
          provide: getRepositoryToken(HelloWorldEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteHelloWorldUseCaseImpl>(DeleteHelloWorldUseCaseImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a hello world entity', async () => {
    mockRepository.findOne.mockResolvedValue(mockEntity);
    mockRepository.softRemove.mockResolvedValue(mockEntity);

    await useCase.execute(1);

    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockRepository.softRemove).toHaveBeenCalledWith(mockEntity);
  });

  it('should throw NotFoundException when entity not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
  });
});
