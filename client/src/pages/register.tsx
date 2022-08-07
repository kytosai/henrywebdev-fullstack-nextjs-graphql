import InputField from '@/components/InputField';
import Wrapper from '@/components/Wrapper';
import { RegisterInput, useRegisterMutation } from '@/generated/graphql';
import { Alert, Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';

const RegisterPage = () => {
  const [register, registerState] = useRegisterMutation();
  const { data, error } = registerState;

  const onRegisterSubmit = async (values: RegisterInput) => {
    try {
      const resp = await register({
        variables: {
          registerInput: values,
        },
      });

      console.log({ resp });
    } catch (error) {
      console.log(error);
    }
  };

  const initialValues: RegisterInput = {
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
