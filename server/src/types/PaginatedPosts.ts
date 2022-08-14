import { Field, ObjectType } from 'type-graphql';
import Post from '../entities/Post';

@ObjectType()
class PaginatedPostsResponse {
  @Field()
  totalCount!: number;

  @Field(() => Date)
  cursor!: Date;

  @Field()
  hasMore!: boolean;

  @Field(() => [Post])
  paginatedPosts!: Post[];
}

export default PaginatedPostsResponse;
