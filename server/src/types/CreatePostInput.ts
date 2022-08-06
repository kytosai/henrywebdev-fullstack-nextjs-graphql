import { Field, InputType } from 'type-graphql';

@InputType()
class CreatePostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

export default CreatePostInput;
