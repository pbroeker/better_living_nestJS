import { CoreUser } from '../../../core/users/entity/user.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';

@Entity({ name: 'user-image' })
export class UserImage extends IdentifiableEntity {
  @Column({ default: '' })
  src: string;

  @ManyToMany(() => PersonalRoom, (personalRoom) => personalRoom.userImages)
  personalRooms: PersonalRoom[];

  @ManyToOne(() => CoreUser, (user) => user.images, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;
}
