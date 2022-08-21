import InputField from '@/components/InputField';
import Wrapper from '@/components/Wrapper';
import { LoginInput, MeDocument, MeQuery, useLoginMutation } from '@/generated/graphql';
import { mapFieldErrors } from '@/helpers/mapFieldErrors';
import { useCheckAuth } from '@/utils/useCheckAuth';
import { Alert, Box, Button, Flex, Link, Spinner, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { initializeApollo } from '@/lib/apolloClient';

const LoginPage = () => {
  const router = useRouter();
  const { data: authData, loading: authLoading } = useCheckAuth();
  const [loginUser, loginState] = useLoginMutation();
  const { data, error } = loginState;
  const toast = useToast();
  const initialValues: LoginInput = {
    usernameOrEmail: '',
    password: '',
  };

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
          /*
            Write on old cache `me` query with new info user logged to update layout match the logged status
          */
          if (data?.login.success) {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                me: data.login.user, // because `me` and `user` have same graphql fragment `userInfo`
              },
            });
          }
        },
      });

      console.log(resp.data);

      if (resp.data?.login.errors) {
        setErrors(mapFieldErrors(resp.data.login.errors));
      } else if (resp.data?.login.user) {
        toast({
          title: 'Welcome to my site',
          description: `Logged with username ${resp.data.login.user.username}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });

        const apolloClient = initializeApollo();
        apolloClient.resetStore();
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (authLoading || (!authLoading && authData?.me)) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Wrapper size="small">
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

              <Flex mt={4} alignItems="center" justifyContent="space-between">
                <Button
                  type="submit"
                  colorScheme="teal"
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Login
                </Button>

                <NextLink href="/forgot-password" passHref>
                  <Link>Forgot password?</Link>
                </NextLink>
              </Flex>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default LoginPage;
