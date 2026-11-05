import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Profile } from '../entities/profile.entity.js';
import { NotFoundException } from '@nestjs/common';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) { }





  /**
   * Find a user by email.
   * @param email - The user's email address.
   * @returns The user if found, otherwise null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }





  /**
   * Find a user by ID.
   * @param id - The user's ID.
   * @returns The user if found, otherwise null.
   */
  async findById(id: number) {
    return this.userRepository.findOne({
      where: {
        id
      }
    });
  }





  /**
   * Create a new user and an empty profile.
   * @param data - The user's registration data.
   * @returns The created user.
   */
  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<User> {
    const savedUser = await this.userRepository.manager.transaction(
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

    this.logger.log('User created successfully', {
      userId: savedUser.id,
    });

    return savedUser;
  }





  /**
   * Update user information.
   * @param id - The user's ID.
   * @param dto - The new user information.
   * @returns The updated user.
   */
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);

    const updatedUser = await this.userRepository.save(user);

    this.logger.log('User updated successfully', {
      userId: updatedUser.id,
    });

    return updatedUser;
  }





  /**
   * Find a user by ID.
   * @param id - The user's ID.
   * @returns The user information.
   */
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





  /**
   * Get all users.
   * @returns A list of users.
   */
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





  /**
   * Delete a user by ID.
   * @param id - The user's ID.
   * @returns Nothing.
   */
  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);

    this.logger.log('User deleted successfully', {
      userId: id,
    });
  }

  // -------------------GET&PATCH profile (user)-----------------------

  /**
   * Get the current user's profile.
   * @param id - The user's ID.
   * @returns The user's profile information.
   */
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
        profile: {
          avatarMedia: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }





  /**
   * Update the current user's profile.
   * @param id - The user's ID.
   * @param dto - The profile information to update.
   * @returns The updated profile information.
   */
  async updateMyProfile(
    id: number,
    dto: UpdateMyProfileDto,
  ) {
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

    this.logger.log('User profile updated successfully', {
      userId: id,
    });

    return this.getMyProfile(id);
  }





  /**
   * Update the user's password.
   * @param userId - The user's ID.
   * @param hashpassword - The new hashed password.
   * @returns Nothing.
   */
  async updatePassword(
    userId: number,
    hashpassword: string,
  ): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { password: hashpassword }
    );

  }
}