import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Post } from '../../posts/entities/post.entity.js';
import { Media } from '../../media/entities/media.entity.js';

export enum BlockType {
    TEXT = 'text',
    IMAGE = 'image',
}


@Entity()
@Index(['postId', 'position'], { unique: true })
export class Block {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
    type: 'enum',
    enum: BlockType,
    default: BlockType.TEXT,
    })
    type!: BlockType;

    @Column({ type: 'int', nullable: true })
    mediaId!: number | null;

    @ManyToOne(() => Media, {
    nullable: true,
    onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'mediaId' })
    media!: Relation<Media> | null;

    @Column()
    postId!: number;

    @ManyToOne(() => Post, (post) => post.blocks, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'postId' })
    post!: Relation<Post>;

    @Column({ type: 'varchar', length: 1024 })
    content!: string;

    @Column()
    position!: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;
}