import { IsNotEmpty } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CoreUser } from '../../../core/users/entity/user.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';

@Entity({ name: 'invitation-token' })
export class InvitationToken extends IdentifiableEntity {
  @Column({ default: uuidv4() })
  @IsNotEmpty()
  token: string;

  @ManyToOne(() => CoreUser, (user) => user.invitationTokens, {
    onDelete: 'CASCADE',
  })
  inviter: CoreUser;
}
