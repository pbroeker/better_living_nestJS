import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';
@Entity({ name: 'core-user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  user_password: string;

  @Column({ default: '' })
  user_email: string;

  @OneToMany(() => PersonalRoom, (personalRoom) => personalRoom.user)
  personalRooms: PersonalRoom[];
}
