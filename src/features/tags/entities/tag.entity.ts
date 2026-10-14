
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { Post } from '../../posts/entities/post.entity.js';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    name!: string;

    @Column({ unique: true, length: 150 })
    slug!: string;

    @ManyToMany(() => Post, (post) => post.tags)
    posts!: Relation<Post[]>;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;
}
