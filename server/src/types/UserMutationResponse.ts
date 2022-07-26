import { Field, ObjectType } from 'type-graphql';
import User from '../entities/User';
import MutationResponse from './MutationReponse';

/*
  In video henry use `implements` MutatataionResponse instead of `extends`. However doing so would be wrong use abstract class compared to other language so i will use `extends` instead of `implements`
*/
@ObjectType({ implements: MutationResponse })
class UserMutationResponse extends MutationResponse {
  @Field({ nullable: true })
  user?: User;
}

export default UserMutationResponse;
