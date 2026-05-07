import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { FindOneHelloWorldUseCaseImpl } from './find-one-hello-world.use-case';
import { HelloWorldEntity } from '../entities/hello-world.entity';

describe('FindOneHelloWorldUseCase', () => {
  let useCase: FindOneHelloWorldUseCaseImpl;

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneHelloWorldUseCaseImpl,
        {
          provide: getRepositoryToken(HelloWorldEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindOneHelloWorldUseCaseImpl>(FindOneHelloWorldUseCaseImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a hello world entity by id', async () => {
    mockRepository.findOne.mockResolvedValue(mockEntity);

    const result = await useCase.execute(1);

    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(mockEntity);
  });

  it('should throw NotFoundException when entity not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
  });
});
