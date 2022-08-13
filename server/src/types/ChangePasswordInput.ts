import { Field, InputType } from 'type-graphql';

@InputType()
class ChangePasswordInput {
  @Field()
  newPasword: string;
}

export default ChangePasswordInput;
