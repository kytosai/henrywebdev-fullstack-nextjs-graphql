import { Field, InputType } from 'type-graphql';

@InputType()
class RegisterInput {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;
}

export default RegisterInput;
