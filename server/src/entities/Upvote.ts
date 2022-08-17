import { ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import Post from './Post';
import User from './User';

@ObjectType() // set this class is type in graphql
@Entity()
class Upvote extends BaseEntity {
  @PrimaryColumn() // unique
  userId!: number;

  @ManyToOne(() => User, (user) => user.upvotes)
  user!: User;

  @PrimaryColumn() // unique
  postId!: number;

  @ManyToOne(() => Post, (post) => post.upvotes)
  post!: Post;

  @Column()
  value!: number; // 1: upvote, 2: downvote
}

export default Upvote;
