import InputField from '@/components/InputField';
import Wrapper from '@/components/Wrapper';
import {
  ChangePasswordInput,
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from '@/generated/graphql';
import { mapFieldErrors } from '@/helpers/mapFieldErrors';
import { useCheckAuth } from '@/utils/useCheckAuth';
import { Alert, Box, Button, Spinner, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/router';
import { useState } from 'react';
import NextLink from 'next/link';

const ChangePasswordPage = () => {
  const router = useRouter();
  const { query } = router;
  const [tokenError, setTokenError] = useState<string>('');
  const { data: authData, loading: authLoading } = useCheckAuth();
  const [changePassword] = useChangePasswordMutation();
  const initialValues: ChangePasswordInput = { newPassword: '' };
  const toast = useToast();

  const onChangePasswordSubmit = async (
    values: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>,
  ) => {
    if (!query.userId || !query.token) {
      toast({
        status: 'error',
        title: 'Invalid token or user info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

      return;
    }

    try {
      const resp = await changePassword({
        variables: {
          userId: router.query.userId as string,
          token: router.query.token as string,
          changePasswordInput: values,
        },
        update(cache, { data }) {
          /*
            Write on old cache `me` query with new info user logged to update layout match the logged status
          */
          if (data?.changePassword.success) {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                me: data.changePassword.user, // because `me` and `user` have same graphql fragment `userInfo`
              },
            });
          }
        },
      });

      if (resp.data?.changePassword.errors) {
        const fieldErrors = mapFieldErrors(resp.data.changePassword.errors);
        setErrors(fieldErrors);

        if ('token' in fieldErrors || 'userId' in fieldErrors) {
          setTokenError(fieldErrors['token'] || fieldErrors['userId']);
        }
      }

      if (resp.data?.changePassword.success) {
        toast({
          status: 'success',
          title: 'Change password success!',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
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

  if (!query.userId || !query.token) {
    return (
      <Wrapper>
        <Alert status="error" mb={4}>
          <Box>Invalid page</Box>
        </Alert>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {!!tokenError && (
        <Alert status="error" mb={4}>
          <Box>
            {tokenError}.{' '}
            <NextLink href="/forgot-password">Click here to request new token</NextLink>
          </Box>
        </Alert>
      )}

      <Formik initialValues={initialValues} onSubmit={onChangePasswordSubmit}>
        {(props) => {
          const { handleSubmit, isSubmitting } = props;

          return (
            <Form onSubmit={handleSubmit}>
              <InputField
                name="newPassword"
                type="text"
                placeholder="New password"
                label="New password"
              />

              <Button
                mt={4}
                type="submit"
                colorScheme="teal"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Change password
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default ChangePasswordPage;
