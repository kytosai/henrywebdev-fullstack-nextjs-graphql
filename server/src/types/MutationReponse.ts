import { Field, InterfaceType } from 'type-graphql';
import FieldError from './FieldError';

/*
  Doc: https://typegraphql.com/docs/interfaces.html#defining-interface-type 
*/
@InterfaceType()
abstract class MutationResponse {
  @Field()
  code: number;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

export default MutationResponse;
