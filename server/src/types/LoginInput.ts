import { Field, InputType } from 'type-graphql';

@InputType()
class LoginInput {
  @Field()
  usernameOrEmail: string;

  @Field()
  password: string;
}

export default LoginInput;
