import { Exclude } from 'class-transformer';
import { CoreUser } from '../../../core/users/entity/user.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'guest-user' })
export class GuestUser extends IdentifiableEntity {
  @Column({ default: '' })
  guest_email: string;

  @Exclude()
  @ManyToOne(() => CoreUser, (user) => user.guests, {
    onDelete: 'CASCADE',
  })
  host: CoreUser;
}
