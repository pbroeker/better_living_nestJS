import { PersonalRoomDto } from 'src/feature/personal-room/dto/personal-room.dto';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';

export const personalRoomEntityToDto = (
  personalRooms: PersonalRoom[],
  id: number,
): PersonalRoomDto[] => {
  return personalRooms.map((personalRoom) => {
    const { user, personalArea, ...roomNoUser } = personalRoom;
    return {
      ...roomNoUser,
      personalAreaId: id,
    };
  });
};
