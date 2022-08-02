import { Field, InterfaceType } from 'type-graphql';

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
}

export default MutationResponse;
