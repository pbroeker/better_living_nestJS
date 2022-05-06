import { UserImage } from '../../../feature/user-image/entity/user-image.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { PersonalArea } from 'src/feature/personal-areas/entity/personalArea.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';
import { UserTag } from 'src/feature/user-tag/entity/userTags.entity';

@Entity({ name: 'core-user' })
export class CoreUser extends IdentifiableEntity {
  @Column({ default: '' })
  user_password: string;

  @Column({ default: '' })
  user_email: string;

  @OneToMany(() => PersonalArea, (personalArea) => personalArea.user)
  personalAreas: PersonalArea[];

  @OneToMany(() => UserImage, (image) => image.user)
  images: UserImage[];

  @OneToMany(() => PersonalRoom, (personalRoom) => personalRoom.user)
  personalRooms: PersonalRoom[];

  @OneToMany(() => UserTag, (userTag) => userTag.user)
  userTags: UserTag[];
}
