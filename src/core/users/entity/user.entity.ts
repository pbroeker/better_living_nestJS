import { UserImage } from '../../../feature/user-image/entity/user-image.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { PersonalArea } from './../../../feature/personal-areas/entity/personalArea.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { PersonalRoom } from './../../../feature/personal-room/entity/personalRoom.entity';
import { UserTag } from './../../../feature/user-tag/entity/userTags.entity';
import { InvitationToken } from './../../../feature/invitation-token/entity/invitation-token.entity';
import { UserComment } from 'src/feature/user-comments/entity/userComment.entity';

@Entity({ name: 'core-user' })
export class CoreUser extends IdentifiableEntity {
  @Column({ default: '' })
  user_password: string;

  @Column()
  first_name: string;

  @Column({ default: false })
  news_consent: boolean;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ nullable: true })
  birthday?: string;

  @Column({ unique: true })
  user_email: string;

  @ManyToMany(() => CoreUser, (guest) => guest.hosts)
  @JoinTable()
  guests: CoreUser[];

  @ManyToMany(() => CoreUser, (host) => host.guests)
  hosts: CoreUser[];

  @ManyToMany(() => PersonalArea, (personalArea) => personalArea.users)
  @JoinTable()
  personalAreas: PersonalArea[];

  @OneToMany(() => UserImage, (image) => image.user)
  images: UserImage[];

  @OneToMany(() => PersonalRoom, (personalRoom) => personalRoom.user)
  personalRooms: PersonalRoom[];

  @Column({ default: null })
  currentHashedRefreshToken?: string | null;

  @OneToMany(() => PersonalArea, (personalArea) => personalArea.owner)
  ownedAreas: PersonalArea[];

  @OneToMany(() => UserTag, (userTag) => userTag.user)
  userTags: UserTag[];

  @OneToMany(() => UserComment, (userComment) => userComment.user)
  userComment: UserComment[];

  @OneToMany(() => InvitationToken, (token) => token.inviter)
  invitationTokens: InvitationToken[];
}
