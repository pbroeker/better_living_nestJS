import { CoreUser } from 'src/core/users/entity/user.entity';
import { IdentifiableEntity } from 'src/shared/generic.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'personal-room' })
export class PersonalRoom extends IdentifiableEntity {
  @Column({ default: '' })
  title: string;

  @ManyToOne(() => CoreUser, (user) => user.personalRooms, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;
}
