
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Post } from '../../posts/entities/post.entity.js';
import { User } from '../../entities/user.entity.js';

@Entity()
@Index(
    'IDX_post_view_event_user_daily_unique',
    ['postId', 'userId', 'viewDate'],
    { unique: true },
)
export class PostViewEvent {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    postId!: number;

    @ManyToOne(() => Post, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'postId' })
    post!: Relation<Post>;

    @Column({ type: 'int' })
    userId!: number;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'userId' })
    user!: Relation<User>;

    @Column({ type: 'date' })
    viewDate!: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;
}
