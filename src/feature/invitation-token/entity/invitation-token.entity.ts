import { IsNotEmpty } from 'class-validator';
import { Column, Entity, ManyToOne, Generated } from 'typeorm';
import { CoreUser } from '../../../core/users/entity/user.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';

@Entity({ name: 'invitation-token' })
export class InvitationToken extends IdentifiableEntity {
  @Column()
  @IsNotEmpty()
  @Generated('uuid')
  token: string;

  @ManyToOne(() => CoreUser, (user) => user.invitationTokens, {
    onDelete: 'CASCADE',
  })
  inviter: CoreUser;
}
