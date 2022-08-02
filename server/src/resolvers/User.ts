import User from '../entities/User';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import argon2 from 'argon2';

@Resolver()
class UserResolver {
  @Mutation((_returns) => User, { nullable: true })
  async register(
    @Arg('email') email: string,
    @Arg('username') username: string,
    @Arg('password') password: string,
  ) {
    try {
      const existingUser = await User.findOne({
        where: {
          username,
        },
      });
      if (existingUser) return null;

      const hashedPassword = await argon2.hash(password);

      const newUser = User.create({
        username,
        email,
        password: hashedPassword,
      });

      return User.save(newUser);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default UserResolver;
