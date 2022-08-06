import { Field, InputType } from 'type-graphql';

@InputType()
class UpdatePostInput {
  @Field()
  id: number;

  @Field()
  title: string;

  @Field()
  text: string;
}

export default UpdatePostInput;
