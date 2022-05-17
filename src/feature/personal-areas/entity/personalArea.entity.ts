import { IsNotEmpty } from 'class-validator';
import { CoreUser } from '../../../core/users/entity/user.entity';
import { PersonalRoom } from '../../personal-room/entity/personalRoom.entity';
import { IdentifiableEntity } from '../../../shared/generic.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'personal-area' })
export class PersonalArea extends IdentifiableEntity {
  @Column({ default: '' })
  @IsNotEmpty()
  title: string;

  @OneToMany(() => PersonalRoom, (personalRoom) => personalRoom.personalArea, {
    cascade: ['insert', 'update'],
  })
  personalRooms: PersonalRoom[];

  @ManyToOne(() => CoreUser, (user) => user.personalAreas, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;
}