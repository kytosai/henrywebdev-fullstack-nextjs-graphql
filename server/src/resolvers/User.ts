import { SESSION_COOKIE_NAME } from '../constants';
import User from '../entities/User';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import UserMutationResponse from '../types/UserMutationResponse';
import RegisterInput from '../types/RegisterInput';
import validateRegisterInput from '../utils/validateRegisterInput';
import LoginInput from '../types/LoginInput';
import Context from '../types/Context';

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
  async login(
    @Arg('loginInput') loginInput: LoginInput,
    @Ctx() context: Context,
  ): Promise<UserMutationResponse> {
    const { usernameOrEmail, password } = loginInput;
    const { req } = context;

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

      /*
        save userId to session
      */
      req.session.userId = existingUser.id;

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

  @Mutation(() => Boolean)
  logout(@Ctx() context: Context): Promise<boolean> {
    return new Promise((resolve) => {
      const { req, res } = context;
      res.clearCookie(SESSION_COOKIE_NAME);

      req.session.destroy((error) => {
        if (error) {
          resolve(false);
        }

        resolve(true);
      });
    });
  }
}

export default UserResolver;
