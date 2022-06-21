import { CoreUser } from '../../../core/users/entity/user.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity({ name: 'guest-user' })
export class GuestUser extends IdentifiableEntity {
  @Column({ default: '' })
  guest_email: string;

  @Column()
  core_user_id: number;

  @ManyToMany(() => CoreUser, (user) => user.guests)
  hosts: CoreUser[];
}
