import { Query, Resolver } from 'type-graphql';

@Resolver()
class HelloResolver {
  @Query((_) => String)
  hello() {
    return 'hello world';
  }
}

export default HelloResolver;
