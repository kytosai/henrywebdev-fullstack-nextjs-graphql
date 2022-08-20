import { VoteType } from './../types/VoteType';
import { Field, ID, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Upvote from './Upvote';
import User from './User';

@ObjectType() // set this class is type in graphql
@Entity()
class Post extends BaseEntity {
  @Field((_type) => ID) // because ID is special type, it should be specified
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  userId!: number;

  @OneToMany(() => Upvote, (upvote) => upvote.post)
  upvotes: Upvote[];

  @Field()
  @Column({ default: 0 })
  points!: number; // calc of total up/down vote

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @Field()
  @Column()
  text!: string;

  @Field()
  @CreateDateColumn({
    /*
      must set it for setup pagination with post base on date cursor. default it is `timestampt without time zone`
    */
    type: 'timestamptz',
  })
  createdAt: Date;

  @Field()
  @CreateDateColumn({
    /*
      must set it for setup pagination with post base on date cursor. default it is `timestampt without time zone`
    */
    type: 'timestamptz',
  })
  updateAt: Date;
}

export default Post;
