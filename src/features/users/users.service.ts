
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Profile } from '../entities/profile.entity.js';
import { NotFoundException } from '@nestjs/common';
import type { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  

  async create(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<User> {
  return this.userRepository.manager.transaction(
    async (manager) => {
      const userRepository = manager.getRepository(User);
      const profileRepository = manager.getRepository(Profile);

      const user = userRepository.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      const savedUser = await userRepository.save(user);

      const profile = profileRepository.create({
        user: savedUser,
      });

      await profileRepository.save(profile);

      return savedUser;
    },
  );
}

async update(id: number, dto: UpdateUserDto): Promise<User> {
  const user = await this.userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  Object.assign(user, dto);

  return this.userRepository.save(user);
}



async findOne(id: number): Promise<User> {
  const user = await this.userRepository.findOne({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}


async findAll(): Promise<User[]> {
  return this.userRepository.find({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    order: {
      id: 'ASC',
    },
  });
}

async remove(id: number): Promise<void> {
  const user = await this.userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  await this.userRepository.remove(user);
}


}
