import User from '../entities/User';
import { Arg, Mutation, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import UserMutationResponse from '../types/UserMutationResponse';
import RegisterInput from '../types/RegisterInput';
import validateRegisterInput from '../utils/validateRegisterInput';
import LoginInput from '../types/LoginInput';

@Resolver()
class UserResolver {
  @Mutation(() => UserMutationResponse)
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

  @Mutation(() => UserMutationResponse)
  async login(@Arg('loginInput') loginInput: LoginInput): Promise<UserMutationResponse> {
    const { usernameOrEmail, password } = loginInput;
    try {
      const existingUser = await User.findOne({
        where: [
          (() => {
            if (usernameOrEmail.includes('@')) {
              return { email: usernameOrEmail };
            }

            return {
              username: usernameOrEmail,
            };
          })(),
        ], // query user with username or email
      });

      if (!existingUser) {
        return {
          code: 400,
          success: false,
          message: 'user not found',
          errors: [
            {
              field: 'usernameOrEmail',
              message: 'username or email incorret',
            },
          ],
        };
      }

      const isValidPassword = await argon2.verify(existingUser.password, password);

      if (!isValidPassword) {
        return {
          code: 400,
          success: false,
          message: 'Wrong password',
          errors: [
            {
              field: 'password',
              message: 'password incorret',
            },
          ],
        };
      }

      return {
        code: 200,
        success: true,
        message: 'login successfully!',
        user: existingUser,
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
