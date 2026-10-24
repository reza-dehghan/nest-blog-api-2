
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Profile } from '../entities/profile.entity.js';
import { NotFoundException } from '@nestjs/common';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto.js';
import { promises } from 'dns';

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

async findById(id:number){
  return this.userRepository.findOne({
    where:{
      id
    }
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

// -------------------GET&PATCH profile (user)-----------------------

async getMyProfile(id: number) {
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
      profile: {
        id: true,
        displayName: true,
        bio: true,
        phone: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    relations: {
      profile:{
        avatarMedia:true,
      },
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}

async updateMyProfile(
  id: number,
  dto: UpdateMyProfileDto,
){
  await this.userRepository.manager.transaction(
    async (manager) => {
      const userRepository = manager.getRepository(User);
      const profileRepository = manager.getRepository(Profile);

      const user = await userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userUpdates = Object.fromEntries(
        Object.entries({
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
        }).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(userUpdates).length > 0) {
        Object.assign(user, userUpdates);
        await userRepository.save(user);
      }

      const profileUpdates = Object.fromEntries(
        Object.entries({
          displayName: dto.displayName,
          bio: dto.bio,
          phone: dto.phone,
          website: dto.website,
        }).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(profileUpdates).length > 0) {
        let profile = await profileRepository.findOne({
          where: { user: { id } },
        });

        if (!profile) {
          profile = profileRepository.create({ user });
        }

        Object.assign(profile, profileUpdates);
        await profileRepository.save(profile);
      }
    },
  );
  return this.getMyProfile(id);
}

async updatePassword (
  userId:number,
  hashpassword:string,
):Promise<void>{
  await this.userRepository.update(
    {id:userId},
    {password:hashpassword}
  );
}


}
