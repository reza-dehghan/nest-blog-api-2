
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';
import { Tag } from '../../tags/entities/tag.entity.js';
import { User } from '../../entities/user.entity.js';
import { Block } from '../../blocks/entities/block.entity.js';
import { Media } from '../../media/entities/media.entity.js';

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 200 })
    title!: string;

    @Column({ unique: true, length: 250 })
    slug!: string;

    @Column({ type: 'text', nullable: true })
    excerpt!: string | null;

    @Column({ default: false })
    isPublished!: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    publishedAt!: Date | null;

    @Column()
    authorId!: number;

    @ManyToOne(() => User, (user) => user.posts, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'authorId' })
    author!: Relation<User>;

    @ManyToMany(() => Category, (category) => category.posts)
    @JoinTable({ name: 'post_categories' })
    categories!: Relation<Category[]>;

    @ManyToMany(() => Tag, (tag) => tag.posts)
    @JoinTable({ name: 'post_tags' })
    tags!: Relation<Tag[]>;

    @OneToMany(()=> Block,(block)=>block.post)
    blocks!:Relation<Block[]>;

    @OneToMany(()=>Media,(media)=>media.post)
    images!:Relation<Media[]>;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;
}
