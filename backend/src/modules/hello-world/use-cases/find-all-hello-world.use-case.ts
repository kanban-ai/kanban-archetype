import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelloWorldEntity } from '../entities/hello-world.entity';
import { FindAllHelloWorldUseCase } from './interfaces';

@Injectable()
export class FindAllHelloWorldUseCaseImpl implements FindAllHelloWorldUseCase {
  constructor(
    @InjectRepository(HelloWorldEntity)
    private readonly helloWorldRepository: Repository<HelloWorldEntity>,
  ) {}

  async execute(): Promise<HelloWorldEntity[]> {
    return this.helloWorldRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
