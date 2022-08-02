import { Field, InterfaceType, ObjectType } from 'type-graphql';

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

export default FieldError;
