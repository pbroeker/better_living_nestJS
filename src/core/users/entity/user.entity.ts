import { PersonalRoom } from '../../../feature/personal-room/entity/personalRoom.entity';
import { UserImage } from '../../../feature/user-image/entity/user-image.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { Column, Entity, OneToMany } from 'typeorm';
@Entity({ name: 'core-user' })
export class CoreUser extends IdentifiableEntity {
  @Column({ default: '' })
  user_password: string;

  @Column({ default: '' })
  user_email: string;

  @OneToMany(() => PersonalRoom, (personalRoom) => personalRoom.user)
  personalRooms: PersonalRoom[];

  @OneToMany(() => PersonalRoom, (image) => image.user)
  images: UserImage[];
}
