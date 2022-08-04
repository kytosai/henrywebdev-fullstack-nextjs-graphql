import User from '../entities/User';
import { Field, InterfaceType, ObjectType } from 'type-graphql';
import MutationResponse from './MutationReponse';
import FieldError from './FieldError';

/*
  In video henry use `implements` MutatataionResponse instead of `extends`. However doing so would be wrong use abstract class compared to other language so i will use `extends` instead of `implements`
*/
@ObjectType({ implements: MutationResponse })
class UserMutationResponse extends MutationResponse {
  @Field({ nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

export default UserMutationResponse;
