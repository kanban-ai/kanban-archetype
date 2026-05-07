import { CreateHelloWorldDto, UpdateHelloWorldDto } from '../dto';
import { HelloWorldEntity } from '../entities/hello-world.entity';

export interface CreateHelloWorldUseCase {
  execute(data: CreateHelloWorldDto): Promise<HelloWorldEntity>;
}

export interface UpdateHelloWorldUseCase {
  execute(id: number, data: UpdateHelloWorldDto): Promise<HelloWorldEntity>;
}

export interface DeleteHelloWorldUseCase {
  execute(id: number): Promise<void>;
}

export interface FindAllHelloWorldUseCase {
  execute(): Promise<HelloWorldEntity[]>;
}

export interface FindOneHelloWorldUseCase {
  execute(id: number): Promise<HelloWorldEntity>;
}
