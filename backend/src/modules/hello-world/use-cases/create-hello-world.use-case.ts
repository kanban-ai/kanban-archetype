import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelloWorldEntity } from '../entities/hello-world.entity';
import { CreateHelloWorldDto } from '../dto';
import { CreateHelloWorldUseCase } from './interfaces';

@Injectable()
export class CreateHelloWorldUseCaseImpl implements CreateHelloWorldUseCase {
  constructor(
    @InjectRepository(HelloWorldEntity)
    private readonly helloWorldRepository: Repository<HelloWorldEntity>,
  ) {}

  async execute(data: CreateHelloWorldDto): Promise<HelloWorldEntity> {
    const entity = this.helloWorldRepository.create(data);
    return this.helloWorldRepository.save(entity);
  }
}
