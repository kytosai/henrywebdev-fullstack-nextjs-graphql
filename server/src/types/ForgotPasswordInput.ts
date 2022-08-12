import { Field, InputType } from 'type-graphql';

@InputType()
class ForgotPasswordInput {
  @Field()
  email: string;
}

export default ForgotPasswordInput;
