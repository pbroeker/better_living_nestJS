import { CoreUser } from '../../../core/users/entity/user.entity';
import { EntityWithDates } from '../../../shared/generic.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { PersonalRoom } from '../../personal-room/entity/personalRoom.entity';
import { UserTag } from '../../user-tag/entity/userTags.entity';
import { UserComment } from '../../../feature/user-comments/entity/userComment.entity';

@Entity({ name: 'user-image' })
export class UserImage extends EntityWithDates {
  @Column({ default: '' })
  src: string;

  @Column({ default: '' })
  key: string;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  width: number;

  @ManyToMany(() => PersonalRoom, (personalRoom) => personalRoom.userImages)
  personalRooms: PersonalRoom[];

  @ManyToMany(() => UserTag, (userTag) => userTag.userImages, {
    cascade: ['insert', 'update'],
  })
  userTags: UserTag[];

  @OneToMany(() => UserComment, (userComment) => userComment.userImage)
  userComments: UserComment[];

  @ManyToOne(() => CoreUser, (user) => user.images, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;
}
