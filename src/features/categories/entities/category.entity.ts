
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
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    name!: string;

    @Column({ unique: true, length: 150 })
    slug!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @ManyToMany(() => Post, (post) => post.categories, {
    onDelete: 'RESTRICT',
    })
    posts!: Relation<Post[]>;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;
}
