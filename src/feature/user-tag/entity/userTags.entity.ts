import { Exclude } from 'class-transformer';
import { CoreUser } from '../../../core/user/entity/user.entity';
import { UserImage } from '../../user-image/entity/user-image.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';

@Entity({ name: 'user-tag' })
export class UserTag extends IdentifiableEntity {
  @Column({ nullable: true })
  roomImageCombinations: string;

  @Column({ default: '' })
  title: string;

  @Exclude()
  @ManyToOne(() => CoreUser, (user) => user.userTags, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;

  @ManyToMany(() => UserImage, (userImage) => userImage.userTags)
  @JoinTable()
  userImages: UserImage[];

  @ManyToMany(() => PersonalRoom, (personalRoom) => personalRoom.userTags)
  @JoinTable()
  personalRooms: PersonalRoom[];
}
