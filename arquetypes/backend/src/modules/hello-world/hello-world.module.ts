import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelloWorldController } from './hello-world.controller';
import { HelloWorldEntity } from './entities/hello-world.entity';
import {
  CreateHelloWorldUseCaseImpl,
  UpdateHelloWorldUseCaseImpl,
  DeleteHelloWorldUseCaseImpl,
  FindAllHelloWorldUseCaseImpl,
  FindOneHelloWorldUseCaseImpl,
} from './use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([HelloWorldEntity])],
  controllers: [HelloWorldController],
  providers: [
    CreateHelloWorldUseCaseImpl,
    UpdateHelloWorldUseCaseImpl,
    DeleteHelloWorldUseCaseImpl,
    FindAllHelloWorldUseCaseImpl,
    FindOneHelloWorldUseCaseImpl,
  ],
  exports: [
    CreateHelloWorldUseCaseImpl,
    UpdateHelloWorldUseCaseImpl,
    DeleteHelloWorldUseCaseImpl,
    FindAllHelloWorldUseCaseImpl,
    FindOneHelloWorldUseCaseImpl,
  ],
})
export class HelloWorldModule {}
