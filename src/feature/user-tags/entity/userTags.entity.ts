import { CoreUser } from 'src/core/users/entity/user.entity';
import { UserImage } from 'src/feature/user-image/entity/user-image.entity';
import { IdentifiableEntity } from 'src/shared/generic.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity({ name: 'user-tag' })
export class UserTag extends IdentifiableEntity {
  @Column({ default: '' })
  title: string;

  @ManyToOne(() => CoreUser, (user) => user.userTags, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;

  @ManyToMany(() => UserImage, (userImage) => userImage.userTags)
  @JoinTable()
  userImages: UserImage[];
}
