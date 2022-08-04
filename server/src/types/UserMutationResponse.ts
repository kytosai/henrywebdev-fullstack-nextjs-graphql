import User from '../entities/User';
import { Field, InterfaceType, ObjectType } from 'type-graphql';
import MutationResponse from './MutationReponse';
import FieldError from './FieldError';

@ObjectType({ implements: MutationResponse })
class UserMutationResponse extends MutationResponse {
  @Field({ nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

export default UserMutationResponse;
