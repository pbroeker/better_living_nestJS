import { CoreUser } from '../../../core/users/entity/user.entity';
import { PersonalArea } from '../../personal-areas/entity/personalArea.entity';
import { UserImage } from '../../user-image/entity/user-image.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserComment } from '../../../feature/user-comments/entity/userComment.entity';

@Entity({ name: 'personal-room' })
export class PersonalRoom extends IdentifiableEntity {
  @Column({ default: '' })
  title: string;

  @Column({ default: 0 })
  iconId: number;

  @ManyToOne(() => PersonalArea, (personalArea) => personalArea.personalRooms)
  personalArea: PersonalArea;

  @ManyToOne(() => CoreUser, (user) => user.personalRooms, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;

  @OneToMany(() => UserComment, (userComment) => userComment.personalRoom)
  userComments: UserComment[];

  @ManyToMany(() => UserImage, (userImage) => userImage.personalRooms)
  @JoinTable()
  userImages: UserImage[];
}
