import { CoreUser } from 'src/core/users/entity/user.entity';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';
import { IdentifiableEntity } from 'src/shared/generic.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'personal-area' })
export class PersonalArea extends IdentifiableEntity {
  @Column({ default: '' })
  title: string;

  @OneToMany(() => PersonalRoom, (personalRoom) => personalRoom.personalArea, {
    cascade: true,
  })
  personalRooms: PersonalRoom[];

  @ManyToOne(() => CoreUser, (user) => user.personalAreas, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;
}
