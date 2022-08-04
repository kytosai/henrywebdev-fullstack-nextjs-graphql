import RegisterInput from 'src/types/RegisterInput';

const validateRegisterInput = (registerInput: RegisterInput) => {
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

  if (registerInput.username.length <= 2) {
    return {
      message: 'invalid username',
      errors: [
        {
          field: 'username',
          message: 'Length must be cannot include @',
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

  if (registerInput.username.length <= 2) {
    return {
      message: 'invalid username',
      errors: [
        {
          field: 'password',
          message: 'Length must be cannot include @',
        },
      ],
    };
  }

  return null;
};

export default validateRegisterInput;
