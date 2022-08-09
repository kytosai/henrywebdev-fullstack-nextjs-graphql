import InputField from '@/components/InputField';
import Wrapper from '@/components/Wrapper';
import { LoginInput, MeDocument, useLoginMutation } from '@/generated/graphql';
import { mapFieldErrors } from '@/helpers/mapFieldErrors';
import { Alert, Box, Button } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const router = useRouter();
  const [loginUser, loginState] = useLoginMutation();
  const { data, error } = loginState;

  const onLoginSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>,
  ) => {
    try {
      const resp = await loginUser({
        variables: {
          loginInput: values,
        },
        update(cache, { data }) {
          console.log('LOGIN DATA', data?.login);
          console.log('CACHE', cache);

          const meData = cache.readQuery({ query: MeDocument });
          console.log('CACHE ME', meData);
        },
      });

      console.log(resp.data);

      if (resp.data?.login.errors) {
        setErrors(mapFieldErrors(resp.data.login.errors));
      } else if (resp.data?.login.user) {
        // successfully
        router.push('/');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const initialValues: LoginInput = {
    usernameOrEmail: '',
    password: '',
  };

  return (
    <Wrapper>
      {error && (
        <Alert mb={4} status="error">
          Failed to login! Internal server error
        </Alert>
      )}

      {data && data.login.success && (
        <Alert mb={4} status="success">
          Login successfully!
        </Alert>
      )}

      <Formik initialValues={initialValues} onSubmit={onLoginSubmit}>
        {(props) => {
          const { handleSubmit, isSubmitting } = props;

          return (
            <Form onSubmit={handleSubmit}>
              <InputField
                name="usernameOrEmail"
                type="text"
                placeholder="username or email"
                label="Username or Email"
              />

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

export default LoginPage;
