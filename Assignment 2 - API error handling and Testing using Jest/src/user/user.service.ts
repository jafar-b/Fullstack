import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(createUserDto.password)
      .digest('hex');

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    return {
      success: true,
      data: savedUser,
    };
  }

  async findAll(
    page: number,
    limit: number,
    role?: string,
    sort: 'ASC' | 'DESC' = 'DESC',
  ) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    query
      .orderBy('user.createdAt', sort)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      success: true,
      data: user,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== existing.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateUserDto.email, deletedAt: IsNull() },
      });

      if (emailExists) {
        throw new ConflictException('Email already in use by another user');
      }
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = crypto
        .createHash('sha256')
        .update(updateUserDto.password)
        .digest('hex');
    }

    Object.assign(existing, updateUserDto);
    const updated = await this.userRepository.save(existing);

    return {
      success: true,
      data: updated,
    };
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.softRemove(user);
  }
}