import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindAllHelloWorldUseCaseImpl } from './find-all-hello-world.use-case';
import { HelloWorldEntity } from '../entities/hello-world.entity';

describe('FindAllHelloWorldUseCase', () => {
  let useCase: FindAllHelloWorldUseCaseImpl;

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
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllHelloWorldUseCaseImpl,
        {
          provide: getRepositoryToken(HelloWorldEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllHelloWorldUseCaseImpl>(FindAllHelloWorldUseCaseImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all hello world entities', async () => {
    const entities = [mockEntity];
    mockRepository.find.mockResolvedValue(entities);

    const result = await useCase.execute();

    expect(mockRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual(entities);
  });
});
