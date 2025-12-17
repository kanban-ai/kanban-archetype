import { SuperWithSoftDeleteEntity } from 'src/database/entities/super-with-soft-delete.entity';
import { Column, Entity } from 'typeorm';

@Entity('hello_world')
export class HelloWorldEntity extends SuperWithSoftDeleteEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  active: boolean;
}
