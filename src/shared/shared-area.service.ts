import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonalAreaTitle } from '../types/enums';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { PersonalArea } from '../feature/personal-areas/entity/personalArea.entity';
@Injectable()
export class SharedAreaService {
  constructor(
    @InjectRepository(PersonalArea)
    private personalAreaRepository: Repository<PersonalArea>,
  ) {}

  async createNewArea(
    currentUser: CoreUser,
    title = PersonalAreaTitle.DEFAULT,
  ): Promise<PersonalArea> {
    const createdNewArea = this.personalAreaRepository.create({
      user: currentUser,
      title: title,
    });

    const savedPersonalArea = await this.personalAreaRepository.save(
      createdNewArea,
    );
    return savedPersonalArea;
  }

  async findAll(
    currentUser: CoreUser,
    relations = [],
  ): Promise<PersonalArea[]> {
    return await this.personalAreaRepository.find({
      where: { user: currentUser },
      relations,
    });
  }

  async findByTitle(
    currentUser: CoreUser,
    title: string,
  ): Promise<PersonalArea> {
    const foundArea = await this.personalAreaRepository.findOne({
      where: { user: currentUser, title: title },
    });
    return foundArea;
  }
}
