import { IdentifiableEntity } from 'src/shared/generic.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'user-image' })
export class UserImage extends IdentifiableEntity {
  @Column({ default: '' })
  src: string;
}
