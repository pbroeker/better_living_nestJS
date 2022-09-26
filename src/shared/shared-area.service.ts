import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonalAreaTitle } from '../types/enums';
import { FindOptionsRelations, Repository } from 'typeorm';
import { CoreUser } from '../core/user/entity/user.entity';
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

  async findById(currentUser: CoreUser, areaId: number): Promise<PersonalArea> {
    const foundAreas = await this.personalAreaRepository.findOne({
      where: { owner: currentUser, id: areaId },
    });
    return foundAreas;
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

  async deleteAreas(personalAreas: PersonalArea[]) {
    if (personalAreas.length) {
      const cleanedAreas = personalAreas.map((personalArea) => {
        personalArea.personalRooms = [];
        personalArea.users = [];
        return personalArea;
      });
      const savedAreas = await this.personalAreaRepository.save(cleanedAreas);

      return await this.personalAreaRepository.remove(savedAreas);
    } else {
      return [];
    }
  }
}
