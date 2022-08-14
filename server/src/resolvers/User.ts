import argon2 from 'argon2';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { v4 as uuidv4 } from 'uuid';
import { SESSION_COOKIE_NAME } from '../constants';
import User from '../entities/User';
import ChangePasswordInput from '../types/ChangePasswordInput';
import Context from '../types/Context';
import ForgotPasswordInput from '../types/ForgotPasswordInput';
import LoginInput from '../types/LoginInput';
import RegisterInput from '../types/RegisterInput';
import UserMutationResponse from '../types/UserMutationResponse';
import { sendEmail } from '../utils/sendEmail';
import validateRegisterInput from '../utils/validateRegisterInput';
import { TokenModel } from './../models/Token';

@Resolver()
class UserResolver {
  /*
    Use for get user info for logged user
  */
  @Query(() => User, { nullable: true })
  async me(@Ctx() context: Context): Promise<User | null> {
    const { req } = context;
    if (!req.session.userId) {
      return null;
    }

    const user = await User.findOne({ where: [{ id: req.session.userId }] });
    return user;
  }

  @Mutation(() => UserMutationResponse)
  async register(
    @Arg('registerInput') registerInput: RegisterInput,
    @Ctx() context: Context,
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
    const { req } = context;

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
              message: `${
                existingUser.username === username ? 'Username' : 'Email'
              } already taken`,
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

      req.session.userId = createdUser.id;

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

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput,
  ): Promise<boolean> {
    const { email } = forgotPasswordInput;
    const user = await User.findOne({ where: [{ email }] });

    if (!user) {
      return true;
    }

    // Check existing token and delte, avoid create multi token with same user id
    await TokenModel.findOneAndDelete({ userId: user.id });
    /*
      Setup reset password token
      - You have to hash reset token because if anyone has access to the database they will be able to create a link to change the user's password
    */
    const resetToken = uuidv4();
    const hashedResetToken = await argon2.hash(resetToken);
    await new TokenModel({
      userId: `${user.id}`,

      token: hashedResetToken,
    }).save();

    // Send mail for user
    const resetUrl = `http://localhost:3000/change-password?token=${resetToken}&userId=${user.id}`;
    await sendEmail(
      email,
      `<a href="${resetUrl}">Click here to reset your password!</a>`,
    );

    return true;
  }

  @Mutation(() => UserMutationResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('userId') userId: string,
    @Arg('changePasswordInput') changePasswordInput: ChangePasswordInput,
    @Ctx() context: Context,
  ): Promise<UserMutationResponse> {
    if (changePasswordInput.newPassword.length <= 2) {
      return {
        code: 400,
        success: false,
        message: 'invalid password',
        errors: [
          {
            field: 'newPassword',
            message: 'Length mút be greater than 2',
          },
        ],
      };
    }

    try {
      // Check existing token
      const resetPasswordTokenRecord = await TokenModel.findOne({ userId });
      if (!resetPasswordTokenRecord) {
        return {
          code: 400,
          success: false,
          message: `Invalid or expired password reset token`,
          errors: [
            {
              field: 'token',
              message: 'Invalid or expired password reset token',
            },
          ],
        };
      }

      // Check token valid
      const resetPasswordTokenValid = await argon2.verify(
        resetPasswordTokenRecord.token,
        token,
      );
      if (!resetPasswordTokenValid) {
        return {
          code: 400,
          success: false,
          message: `Invalid password reset token`,
          errors: [
            {
              field: 'token',
              message: 'Invalid password reset token',
            },
          ],
        };
      }

      // Check existing user id
      const user = await User.findOne({
        where: [
          {
            id: parseInt(userId),
          },
        ],
      });
      if (!user) {
        return {
          code: 400,
          success: false,
          message: `User no longer exists`,
          errors: [
            {
              field: 'userId',
              message: 'User no longer exists',
            },
          ],
        };
      }

      // Update new password to db
      const updatedPassword = await argon2.hash(changePasswordInput.newPassword);
      await User.update(
        {
          id: parseInt(userId),
        },
        {
          password: updatedPassword,
        },
      );

      // Remove token
      await resetPasswordTokenRecord.remove();

      // Create session login for user
      const { req } = context;
      req.session.userId = parseInt(userId);

      return {
        code: 200,
        success: true,
        message: `Update new password successfully`,
        user,
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
