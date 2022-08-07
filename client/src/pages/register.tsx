import InputField from '@/components/InputField';
import Wrapper from '@/components/Wrapper';
import { Alert, Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useMutation } from '@apollo/client';
import { registerMutation } from '@/graphqlClient/mutations';

interface UserMutationResponse {
  code: number;
  success: boolean;
  message: string;
  user: any;
  errors: {
    field: string;
    message: string;
  }[];
}

interface NewUserInput {
  username: string;
  password: string;
  email: string;
}

const RegisterPage = () => {
  const [register, registerResp] = useMutation<
    {
      register: UserMutationResponse;
    },
    {
      registerInput: NewUserInput;
    }
  >(registerMutation);
  const { data, error } = registerResp;

  const onRegisterSubmit = async (values: NewUserInput) => {
    try {
      const resp = await register({
        variables: {
          registerInput: values,
        },
      });

      if (resp.data?.register.success) {
      }
    } catch (error) {
      console.log(error);
    }
  };

  const initialValues: NewUserInput = {
    username: '',
    email: '',
    password: '',
  };

  return (
    <Wrapper>
      {error && (
        <Alert mb={4} status="error">
          Failed to register!
        </Alert>
      )}

      {data && data.register.success ? (
        <Alert mb={4} status="success">
          Register successfully!
        </Alert>
      ) : (
        <Alert mb={4} status="error">
          {data?.register.message}
        </Alert>
      )}

      <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
        {(props) => {
          const { handleSubmit, isSubmitting } = props;

          return (
            <Form onSubmit={handleSubmit}>
              <InputField
                name="username"
                type="text"
                placeholder="Username"
                label="Username"
              />

              <Box mt={4}>
                <InputField name="email" type="email" placeholder="email" label="Email" />
              </Box>

              <Box mt={4}>
                <InputField
                  name="password"
                  type="password"
                  placeholder="password"
                  label="Password"
                />
              </Box>

              <Button
                mt={4}
                type="submit"
                colorScheme="teal"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Register
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default RegisterPage;
