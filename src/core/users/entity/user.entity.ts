import { PersonalArea } from 'src/feature/personal-areas/entity/personalArea.entity';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';
import { IdentifiableEntity } from 'src/shared/generic.entity';
import { Column, Entity, OneToMany } from 'typeorm';
@Entity({ name: 'core-user' })
export class CoreUser extends IdentifiableEntity {
  @Column({ default: '' })
  user_password: string;

  @Column({ default: '' })
  user_email: string;

  @OneToMany(() => PersonalRoom, (personalRoom) => personalRoom.user)
  personalRooms: PersonalRoom[];

  @OneToMany(() => PersonalArea, (personalArea) => personalArea.user)
  personalAreas: PersonalArea[];
}
