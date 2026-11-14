
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';
import { Post } from '../../posts/entities/post.entity.js';
import { User } from '../../entities/user.entity.js';

@Entity('media')
export class Media {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: 'varchar',
        length: 500,
        unique: true,
    })
    storageKey!: string;

    @Column({
        type: 'varchar',
        length: 255,
    })
    originalName!: string;

    @Column({
        type: 'varchar',
        length: 100,
    })
    contentType!: string;

    @Column({
        type: 'bigint',
    })
    size!: string;

    @ManyToOne(()=>Post,(post)=>post.images,{
        nullable:true,
        onDelete:'CASCADE',
    })
    @JoinColumn({name:'postId'})
    post!:Relation<Post>|null;

    @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'ownerId' })
    owner!: Relation<User>;

    @CreateDateColumn({
        type: 'timestamptz',
    })
    createdAt!: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
    })
    updatedAt!: Date;
}
