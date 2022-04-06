import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { CoreUser } from 'src/core/users/entity/user.entity';
import { Repository, Connection } from 'typeorm';
import { PersonalRoom } from '../personal-room/entity/personalRoom.entity';
import {
  PersonalAreaReqDto,
  PersonalAreaResDto,
} from './dto/personal-area.dto';
import { PersonalArea } from './entity/personalArea.entity';
import { getUserWithQueryRunner } from 'src/utils/features/userFunctions';
import { personalRoomEntityToDto } from 'src/utils/features/roomFunctions';

@Injectable()
export class PersonalAreaService {
  constructor(
    private connection: Connection,
    @InjectRepository(PersonalArea)
    private personalAreaRepository: Repository<PersonalArea>,
    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
  ) {}

  async getAllAreas(user: CoreUserDto): Promise<any[]> {
    try {
      const activeCoreUser = await this.userRepository.findOne(user.userId);
      const personalAreas = await this.personalAreaRepository.find({
        relations: ['personalRooms', 'user'],
        where: {
          user: activeCoreUser,
        },
      });

      const personalAreaDtos = personalAreas.map((personalArea) => {
        const personalRoomDtos = personalRoomEntityToDto(
          personalArea.personalRooms,
          personalArea.id,
        );

        return {
          title: personalArea.title,
          id: personalArea.id,
          personalRooms: personalRoomDtos,
        };
      });
      return personalAreaDtos;
    } catch (error) {
      return [];
    }
  }

  async createPersonalArea(
    personalAreaReqDto: PersonalAreaReqDto,
    user: CoreUserDto,
  ): Promise<PersonalAreaResDto> {
    // using queryRunner to ensure transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const activeCoreUser = await getUserWithQueryRunner(
        queryRunner,
        user,
        'personalRooms',
      );

      const roomEntitiesToEdit = activeCoreUser.personalRooms.filter(
        (personalRoom) => {
          return personalAreaReqDto.personalRoomIds.includes(personalRoom.id);
        },
      );

      const newPersonalAreaEntity = queryRunner.manager.create(PersonalArea, {
        user: activeCoreUser,
        title: personalAreaReqDto.title,
        personalRooms: roomEntitiesToEdit,
      });

      const savedPersonalAreaEntity = await queryRunner.manager.save(
        PersonalArea,
        newPersonalAreaEntity,
      );

      // Updating roomEntities to be related to this new area
      await Promise.all(
        roomEntitiesToEdit.map(async (roomEntity) => {
          return await queryRunner.manager.update(PersonalRoom, roomEntity.id, {
            ...roomEntity,
            personalArea: savedPersonalAreaEntity,
          });
        }),
      );

      await queryRunner.commitTransaction();

      return {
        title: savedPersonalAreaEntity.title,
        id: savedPersonalAreaEntity.id,
        personalRooms: personalRoomEntityToDto(
          savedPersonalAreaEntity.personalRooms,
          savedPersonalAreaEntity.id,
        ),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          title: 'personal_areas.error.create_personal_area.title',
          text: 'personal_areas.error.create_personal_area.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
