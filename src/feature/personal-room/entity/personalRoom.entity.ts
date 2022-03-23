import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/core/users/entity/user.entity';

@Entity({ name: 'personal-room' })
export class PersonalRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  title: string;

  @ManyToOne(() => User, (user) => user.personalRooms)
  user: User;
}
