import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';
import { UserTag } from 'src/feature/user-tag/entity/userTags.entity';

export class ImageFilterOptions {
  users?: { first_name: string; id: number }[];
  rooms?: PersonalRoom[];
  tags?: UserTag[];
}
