import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'personal-room' })
export class PersonalRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  title: string;
}
