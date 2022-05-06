import { CoreUser } from '../../../core/users/entity/user.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { PersonalRoom } from '../../personal-room/entity/personalRoom.entity';
import { UserTag } from '../../user-tags/entity/userTags.entity';

@Entity({ name: 'user-image' })
export class UserImage extends IdentifiableEntity {
  @Column({ default: '' })
  src: string;

  @ManyToMany(() => PersonalRoom, (personalRoom) => personalRoom.userImages)
  personalRooms: PersonalRoom[];

  @ManyToMany(() => UserTag, (userTag) => userTag.userImages)
  userTags: UserTag[];

  @ManyToOne(() => CoreUser, (user) => user.images, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;
}
