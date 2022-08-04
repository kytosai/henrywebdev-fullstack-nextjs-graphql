import User from '../entities/User';
import { Arg, Mutation, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import UserMutationResponse from '../types/UserMutationResponse';
import RegisterInput from '../types/RegisterInput';
import validateRegisterInput from '../utils/validateRegisterInput';

@Resolver()
class UserResolver {
  @Mutation(() => UserMutationResponse, { nullable: true })
  async register(
    @Arg('registerInput') registerInput: RegisterInput,
  ): Promise<UserMutationResponse> {
    const validateInput = validateRegisterInput(registerInput);
    if (validateInput) {
      return {
        code: 400,
        success: false,
        message: validateInput.message,
        errors: validateInput.errors,
      };
    }

    const { username, email, password } = registerInput;

    try {
      const existingUser = await User.findOne({
        where: [{ username }, { email }], // query user with username or email
      });

      if (existingUser) {
        return {
          code: 400,
          success: false,
          message: 'Duplicated username or email',
          errors: [
            {
              field: existingUser.username === username ? 'username' : 'email',
              message: 'username or email already taken',
            },
          ],
        };
      }

      const hashedPassword = await argon2.hash(password);

      const newUser = User.create({
        username,
        email,
        password: hashedPassword,
      });

      const createdUser = await User.save(newUser);

      return {
        code: 200,
        success: true,
        message: '',
        user: createdUser,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `interal server error ${error.message}`,
      };
    }
  }
}

export default UserResolver;
