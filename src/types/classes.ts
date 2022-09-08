import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';
import { UserTagResDto } from 'src/feature/user-tag/dto/user-tag.dto';

export class ImageFilterOptions {
  users?: { first_name: string; id: number }[];
  rooms?: PersonalRoom[];
  tags?: UserTagResDto[];
}
