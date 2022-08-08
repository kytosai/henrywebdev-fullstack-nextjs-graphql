import InputField from '@/components/InputField';
import Wrapper from '@/components/Wrapper';
import { RegisterInput, useRegisterMutation } from '@/generated/graphql';
import { mapFieldErrors } from '@/helpers/mapFieldErrors';
import { Alert, Box, Button } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/router';

const RegisterPage = () => {
  const router = useRouter();
  const [register, registerState] = useRegisterMutation();
  const { data, error } = registerState;

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>,
  ) => {
    try {
      const resp = await register({
        variables: {
          registerInput: values,
        },
      });

      if (resp.data?.register.errors) {
        setErrors(mapFieldErrors(resp.data.register.errors));
      } else if (resp.data?.register.user) {
        // successfully
        router.push('/');
      }
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

      {data && data.register.success && (
        <Alert mb={4} status="success">
          Register successfully!
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
