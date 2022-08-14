import InputField from '@/components/InputField';
import Wrapper from '@/components/Wrapper';
import { ForgotPasswordInput, useForgotPasswordMutation } from '@/generated/graphql';
import { useCheckAuth } from '@/utils/useCheckAuth';
import { Box, Button, Flex, Link, Spinner } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const { data: authData, loading: authLoading } = useCheckAuth();
  const [forgotPassword, { data, loading }] = useForgotPasswordMutation();
  const initialValues: ForgotPasswordInput = { email: '' };

  const onForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
    try {
      await forgotPassword({
        variables: {
          forgotPasswordInput: values,
        },
      });
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
      <Formik initialValues={initialValues} onSubmit={onForgotPasswordSubmit}>
        {(props) => {
          const { handleSubmit, isSubmitting } = props;

          if (!loading && data) {
            return <Box>Please check your inbox</Box>;
          }

          return (
            <Form onSubmit={handleSubmit}>
              <InputField name="email" type="email" placeholder="email" label="Email" />

              <Flex mt={4} alignItems="center" justifyContent="space-between">
                <Button
                  type="submit"
                  colorScheme="teal"
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Submit
                </Button>

                <NextLink href="/login" passHref>
                  <Link>Back to login</Link>
                </NextLink>
              </Flex>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default ForgotPasswordPage;
