import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CoreUser } from 'src/core/users/entity/user.entity';

@Entity({ name: 'personal-room' })
export class PersonalRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  title: string;

  @ManyToOne(() => CoreUser, (user) => user.personalRooms, {
    onDelete: 'CASCADE',
  })
  user: CoreUser;
}
