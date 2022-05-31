import { UserImage } from '../../../feature/user-image/entity/user-image.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { PersonalArea } from './../../../feature/personal-areas/entity/personalArea.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { PersonalRoom } from './../../../feature/personal-room/entity/personalRoom.entity';
import { UserTag } from './../../../feature/user-tag/entity/userTags.entity';
import { InvitationToken } from './../../../feature/invitation-token/entity/invitation-token.entity';

@Entity({ name: 'core-user' })
export class CoreUser extends IdentifiableEntity {
  @Column({ default: '' })
  user_password: string;

  @Column({ default: '' })
  user_email: string;

  @Column('int', { array: true, nullable: true })
  guestIds: number[];

  @ManyToMany(() => PersonalArea, (personalArea) => personalArea.users)
  @JoinTable()
  personalAreas: PersonalArea[];

  @OneToMany(() => UserImage, (image) => image.user)
  images: UserImage[];

  @OneToMany(() => PersonalRoom, (personalRoom) => personalRoom.user)
  personalRooms: PersonalRoom[];

  @OneToMany(() => PersonalArea, (personalArea) => personalArea.owner)
  ownedAreas: PersonalArea[];

  @OneToMany(() => UserTag, (userTag) => userTag.user)
  userTags: UserTag[];

  @OneToMany(() => InvitationToken, (token) => token.inviter)
  invitationTokens: InvitationToken[];
}
