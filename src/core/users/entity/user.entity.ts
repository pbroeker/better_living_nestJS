import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'core-user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  user_password: string;

  @Column({ default: '' })
  user_email: string;
}
