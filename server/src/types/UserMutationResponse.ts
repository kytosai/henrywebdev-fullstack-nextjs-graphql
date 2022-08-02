import User from '../entities/User';
import { Field, InterfaceType } from 'type-graphql';
import MutationResponse from './MutationReponse';
import FieldError from './FieldError';

@InterfaceType({ implements: MutationResponse })
class UserMutationResponse implements MutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field({ nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

export default UserMutationResponse;
