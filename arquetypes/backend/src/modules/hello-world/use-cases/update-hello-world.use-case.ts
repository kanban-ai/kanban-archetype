import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelloWorldEntity } from '../entities/hello-world.entity';
import { UpdateHelloWorldDto } from '../dto';
import { UpdateHelloWorldUseCase } from './interfaces';

@Injectable()
export class UpdateHelloWorldUseCaseImpl implements UpdateHelloWorldUseCase {
  constructor(
    @InjectRepository(HelloWorldEntity)
    private readonly helloWorldRepository: Repository<HelloWorldEntity>,
  ) {}

  async execute(id: number, data: UpdateHelloWorldDto): Promise<HelloWorldEntity> {
    const entity = await this.helloWorldRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`HelloWorld with ID "${id}" not found`);
    }
    Object.assign(entity, data);
    return this.helloWorldRepository.save(entity);
  }
}
