import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateHelloWorldUseCaseImpl } from './update-hello-world.use-case';
import { HelloWorldEntity } from '../entities/hello-world.entity';

describe('UpdateHelloWorldUseCase', () => {
  let useCase: UpdateHelloWorldUseCaseImpl;

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
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateHelloWorldUseCaseImpl,
        {
          provide: getRepositoryToken(HelloWorldEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateHelloWorldUseCaseImpl>(UpdateHelloWorldUseCaseImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a hello world entity', async () => {
    const updateDto = { title: 'Updated Title' };
    const updatedEntity = { ...mockEntity, ...updateDto };

    mockRepository.findOne.mockResolvedValue(mockEntity);
    mockRepository.save.mockResolvedValue(updatedEntity);

    const result = await useCase.execute(1, updateDto);

    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result.title).toBe(updateDto.title);
  });

  it('should throw NotFoundException when entity not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999, { title: 'Updated' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
