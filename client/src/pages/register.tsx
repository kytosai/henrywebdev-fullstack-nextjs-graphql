import InputField from '@/components/InputField';
import Wrapper from '@/components/Wrapper';
import {
  MeDocument,
  MeQuery,
  RegisterInput,
  useRegisterMutation,
} from '@/generated/graphql';
import { mapFieldErrors } from '@/helpers/mapFieldErrors';
import { useCheckAuth } from '@/utils/useCheckAuth';
import { Alert, Box, Button, Spinner, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/router';

const RegisterPage = () => {
  const router = useRouter();
  const { data: authData, loading: authLoading } = useCheckAuth();
  const [register, registerState] = useRegisterMutation();
  const { data, error } = registerState;
  const toast = useToast();

  const initialValues: RegisterInput = {
    username: '',
    email: '',
    password: '',
  };

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>,
  ) => {
    try {
      const resp = await register({
        variables: {
          registerInput: values,
        },
        update(cache, { data }) {
          /*
            Write on old cache `me` query with new info user logged to update layout match the logged status
          */
          if (data?.register.success) {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                me: data.register.user, // because `me` and `user` have same graphql fragment `userInfo`
              },
            });
          }
        },
      });

      if (resp.data?.register.errors) {
        setErrors(mapFieldErrors(resp.data.register.errors));
      } else if (resp.data?.register.user) {
        toast({
          title: 'Welcome to my site',
          description: `Registered with username ${resp.data.register.user.username}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });

        router.push('/');
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
          Failed to register! Internal server error
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
