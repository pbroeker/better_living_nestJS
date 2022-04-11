import { PersonalArea } from 'src/feature/personal-areas/entity/personalArea.entity';
import { IdentifiableEntity } from 'src/shared/generic.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'personal-room' })
export class PersonalRoom extends IdentifiableEntity {
  @Column({ default: '' })
  title: string;

  @ManyToOne(() => PersonalArea, (personalArea) => personalArea)
  personalArea: PersonalArea;
}
