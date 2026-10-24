
import { Column, CreateDateColumn, Entity, OneToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import type { Relation } from 'typeorm';
import { Profile } from './profile.entity.js';
import { Post } from '../posts/entities/post.entity.js';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Column({ length: 100 })
    firstName!: string;

    @Column({ length: 100 })
    lastName!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role!: UserRole;

    @OneToOne(() => Profile, (profile) => profile.user)
    profile!: Relation<Profile>;

      @OneToMany(() => Post, (post) => post.author)
      posts!: Relation<Post[]>;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}


