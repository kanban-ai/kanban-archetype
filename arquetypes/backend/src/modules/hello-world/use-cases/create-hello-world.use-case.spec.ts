import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateHelloWorldUseCaseImpl } from './create-hello-world.use-case';
import { HelloWorldEntity } from '../entities/hello-world.entity';

describe('CreateHelloWorldUseCase', () => {
  let useCase: CreateHelloWorldUseCaseImpl;

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
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHelloWorldUseCaseImpl,
        {
          provide: getRepositoryToken(HelloWorldEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateHelloWorldUseCaseImpl>(CreateHelloWorldUseCaseImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a hello world entity', async () => {
    const createDto = { title: 'Test Title', description: 'Test Description' };

    mockRepository.create.mockReturnValue(mockEntity);
    mockRepository.save.mockResolvedValue(mockEntity);

    const result = await useCase.execute(createDto);

    expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    expect(mockRepository.save).toHaveBeenCalledWith(mockEntity);
    expect(result).toEqual(mockEntity);
  });
});
