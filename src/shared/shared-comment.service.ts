import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/user/entity/user.entity';
import { UserComment } from 'src/feature/user-comments/entity/userComment.entity';

@Injectable()
export class SharedCommentService {
  constructor(
    @InjectRepository(UserComment)
    private userCommentRepository: Repository<UserComment>,
  ) {}

  async findAll(): Promise<UserComment[]> {
    return await this.userCommentRepository.find({
      relations: {
        userImage: true,
        personalRoom: true,
        user: true,
      },
    });
  }

  async findAllOwned(currentUser: CoreUser): Promise<UserComment[]> {
    return await this.userCommentRepository.find({
      where: { user: currentUser },
      relations: {
        userImage: true,
        personalRoom: true,
        user: true,
      },
    });
  }

  async deleteComments(userComments: UserComment[]) {
    if (userComments.length) {
      const cleanedComments = userComments.map((userComment) => {
        userComment.personalRoom = undefined;
        userComment.userImage = undefined;
        return userComment;
      });
      const savedComments = await this.userCommentRepository.save(
        cleanedComments,
      );

      return await this.userCommentRepository.remove(savedComments);
    } else {
      return [];
    }
  }
}
