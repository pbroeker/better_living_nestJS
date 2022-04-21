import { CoreUser } from 'src/core/users/entity/user.entity';
import { PersonalArea } from 'src/feature/personal-areas/entity/personalArea.entity';
import { IdentifiableEntity } from 'src/shared/generic.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'personal-room' })
export class PersonalRoom extends IdentifiableEntity {
  @Column({ default: '' })
  title: string;

  @Column({ default: 0 })
  iconId: number;

  @ManyToOne(() => PersonalArea, (personalArea) => personalArea.personalRooms)
  personalArea: PersonalArea;

  @ManyToOne(() => CoreUser, (user) => user.personalRooms, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;
}
