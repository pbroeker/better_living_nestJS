import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonalAreaTitle } from '../types/enums';
import { FindOptionsRelations, Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { PersonalArea } from '../feature/personal-areas/entity/personalArea.entity';
@Injectable()
export class SharedAreaService {
  constructor(
    @InjectRepository(PersonalArea)
    private personalAreaRepository: Repository<PersonalArea>,
  ) {}

  async findAllOwned(
    currentUser: CoreUser,
    relations: FindOptionsRelations<PersonalArea> | string[],
  ): Promise<PersonalArea[]> {
    return await this.personalAreaRepository.find({
      where: { owner: currentUser },
      relations: relations,
    });
  }

  async updateAreas(updatedAreas: PersonalArea[]) {
    return await this.personalAreaRepository.save(updatedAreas);
  }

  async createNewArea(
    currentUser: CoreUser,
    guestsOfUser: CoreUser[],
    title = PersonalAreaTitle.DEFAULT,
  ): Promise<PersonalArea> {
    const createdNewArea = this.personalAreaRepository.create({
      users: [...guestsOfUser, currentUser],
      owner: currentUser,
      title: title,
    });

    const savedPersonalArea = await this.personalAreaRepository.save(
      createdNewArea,
    );
    return savedPersonalArea;
  }

  async findByTitle(
    currentUser: CoreUser,
    title: string,
  ): Promise<PersonalArea> {
    const foundArea = await this.personalAreaRepository.findOne({
      where: { owner: currentUser, title: title },
    });
    return foundArea;
  }

  async removeUserFromArea(areas: PersonalArea[], guestId: number) {
    const updatedPersonalAreas = areas.map((personalArea) => {
      personalArea.users = personalArea.users.filter(
        (user) => user.id !== guestId,
      );
      return personalArea;
    });

    return await this.personalAreaRepository.save(updatedPersonalAreas);
  }
}
