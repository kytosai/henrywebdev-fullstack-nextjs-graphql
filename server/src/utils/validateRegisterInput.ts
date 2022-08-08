import RegisterInput from 'src/types/RegisterInput';

const validateRegisterInput = (registerInput: RegisterInput) => {
  if (registerInput.username.length <= 2) {
    return {
      message: 'invalid username',
      errors: [
        {
          field: 'username',
          message: 'Length must be greater than 2',
        },
      ],
    };
  }

  if (registerInput.username.includes('@')) {
    return {
      message: 'invalid username',
      errors: [
        {
          field: 'username',
          message: 'Username cannot include @',
        },
      ],
    };
  }

  if (!registerInput.email.includes('@')) {
    return {
      message: 'invalid email',
      errors: [
        {
          field: 'email',
          message: 'Email must include @',
        },
      ],
    };
  }

  if (registerInput.password.length <= 2) {
    return {
      message: 'invalid password',
      errors: [
        {
          field: 'password',
          message: 'Length must be greater than 2',
        },
      ],
    };
  }

  return null;
};

export default validateRegisterInput;
