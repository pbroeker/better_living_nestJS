import { CoreUser } from '../../../core/user/entity/user.entity';
import { UserImage } from '../../user-image/entity/user-image.entity';
import { PersonalRoom } from '../../../feature/personal-room/entity/personalRoom.entity';
import { EntityWithDates } from '../../../shared/generic.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'user-comment' })
export class UserComment extends EntityWithDates {
  @Column({ default: '' })
  content: string;

  @ManyToOne(() => CoreUser, (user) => user.userTags, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;

  @ManyToOne(() => UserImage, (userImage) => userImage.userComments, {
    onDelete: 'SET NULL',
  })
  userImage: UserImage;

  @ManyToOne(() => PersonalRoom, (personalRoom) => personalRoom.userComments, {
    onDelete: 'SET NULL',
  })
  personalRoom: PersonalRoom;
}
