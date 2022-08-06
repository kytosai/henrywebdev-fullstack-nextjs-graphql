import { Field, ObjectType } from 'type-graphql';
import MutationResponse from './MutationReponse';
import Post from '../entities/Post';

/*
  In video henry use `implements` MutatataionResponse instead of `extends`. However doing so would be wrong use abstract class compared to other language so i will use `extends` instead of `implements`
*/
@ObjectType({ implements: MutationResponse })
class PostMutationResponse extends MutationResponse {
  @Field({ nullable: true })
  post?: Post;
}

export default PostMutationResponse;
