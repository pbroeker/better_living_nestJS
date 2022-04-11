import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { Repository } from 'typeorm';
import { PersonalRoom } from '../personal-room/entity/personalRoom.entity';
import {
  PersonalAreaReqDto,
  PersonalAreaResDto,
} from './dto/personal-area.dto';
import { PersonalArea } from './entity/personalArea.entity';
import { personalRoomEntityToDto } from 'src/utils/features/roomFunctions';
import { SharedUserService } from '../../shared/shared-user.service';

@Injectable()
export class PersonalAreaService {
  constructor(
    @InjectRepository(PersonalArea)
    private personalAreaRepository: Repository<PersonalArea>,
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
    private sharedUserService: SharedUserService,
  ) {}

  async getAllAreas(coreUserDto: CoreUserDto): Promise<PersonalAreaResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        coreUserDto.email,
      );

      const personalAreaEntities = await this.personalAreaRepository.find({
        where: { user: activeCoreUser },
        relations: ['personalRooms'],
      });

      const personalAreaDtos = personalAreaEntities.map((personalArea) => {
        const personalRoomDtos = personalRoomEntityToDto(
          personalArea.personalRooms,
          personalArea.id,
        );
        const { user, ...personalAreaNoUser } = personalArea;
        return {
          ...personalAreaNoUser,
          personalRooms: personalRoomDtos,
        };
      });
      return personalAreaDtos;
    } catch (error) {
      throw new HttpException(
        {
          title: 'Personal areas could not be loaded',
          error: error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPersonalArea(
    personalAreaReqDto: PersonalAreaReqDto,
    coreUserDto: CoreUserDto,
  ): Promise<PersonalAreaResDto> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        coreUserDto.email,
      );

      const personalRooms = await this.personalRoomRepository.find({
        where: { user: activeCoreUser },
      });

      const roomsToEdit = personalRooms.filter((personalRoom) =>
        personalAreaReqDto.personalRoomIds.includes(personalRoom.id),
      );

      let newAreaEntity: PersonalArea;
      if (personalAreaReqDto.title) {
        newAreaEntity = this.personalAreaRepository.create({
          user: activeCoreUser,
          title: personalAreaReqDto.title,
          personalRooms: roomsToEdit,
        });
      } else {
        newAreaEntity = this.personalAreaRepository.create({
          user: activeCoreUser,
          title: 'Unassigned',
          personalRooms: roomsToEdit,
        });
      }
      const savedPersonalAreaEntity = await this.personalAreaRepository.save(
        newAreaEntity,
      );
      const { user, ...areaEntityNoUser } = savedPersonalAreaEntity;

      return {
        ...areaEntityNoUser,
        personalRooms: personalRoomEntityToDto(
          roomsToEdit,
          areaEntityNoUser.id,
        ),
      } as PersonalAreaResDto;
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_areas.error.create_personal_area.title',
          text: 'personal_areas.error.create_personal_area.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
