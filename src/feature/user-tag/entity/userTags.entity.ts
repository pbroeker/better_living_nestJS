import { Exclude } from 'class-transformer';
import { CoreUser } from '../../../core/users/entity/user.entity';
import { UserImage } from '../../user-image/entity/user-image.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity({ name: 'user-tag' })
export class UserTag extends IdentifiableEntity {
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
}
