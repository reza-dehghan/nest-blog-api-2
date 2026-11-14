
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { User } from './user.entity.js';
import { Media } from '../media/entities/media.entity.js';

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    displayName!: string | null;

    @Column({ type: 'varchar', nullable: true })
    bio!: string | null;

    @OneToOne(() => Media, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'avatarMediaId' })
    avatarMedia!: Relation<Media> | null;

    @Column({ type: 'varchar', nullable: true })
    phone!: string | null;

    @Column({ type: 'varchar', nullable: true })
    website!: string | null;

    @OneToOne(() => User, (user) => user.profile, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    user!: Relation<User>;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
