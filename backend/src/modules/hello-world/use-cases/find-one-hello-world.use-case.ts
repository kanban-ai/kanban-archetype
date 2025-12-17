import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelloWorldEntity } from '../entities/hello-world.entity';
import { FindOneHelloWorldUseCase } from './interfaces';

@Injectable()
export class FindOneHelloWorldUseCaseImpl implements FindOneHelloWorldUseCase {
  constructor(
    @InjectRepository(HelloWorldEntity)
    private readonly helloWorldRepository: Repository<HelloWorldEntity>,
  ) {}

  async execute(id: number): Promise<HelloWorldEntity> {
    const entity = await this.helloWorldRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`HelloWorld with ID "${id}" not found`);
    }
    return entity;
  }
}
