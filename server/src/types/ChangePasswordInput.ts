import { Field, InputType } from 'type-graphql';

@InputType()
class ChangePasswordInput {
  @Field()
  newPassword: string;
}

export default ChangePasswordInput;
