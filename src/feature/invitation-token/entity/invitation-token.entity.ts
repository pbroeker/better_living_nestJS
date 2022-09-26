import { IsNotEmpty } from 'class-validator';
import { Column, Entity, ManyToOne, Generated } from 'typeorm';
import { CoreUser } from '../../../core/user/entity/user.entity';
import { EntityWithDates } from '../../../shared/generic.entity';

@Entity({ name: 'invitation-token' })
export class InvitationToken extends EntityWithDates {
  @Column()
  @IsNotEmpty()
  @Generated('uuid')
  token: string;

  @ManyToOne(() => CoreUser, (user) => user.invitationTokens, {
    onDelete: 'CASCADE',
  })
  inviter: CoreUser;
}
