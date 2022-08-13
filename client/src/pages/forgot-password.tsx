import InputField from '@/components/InputField';
import Wrapper from '@/components/Wrapper';
import { ForgotPasswordInput, useForgotPasswordMutation } from '@/generated/graphql';
import { useCheckAuth } from '@/utils/useCheckAuth';
import { Box, Button, Spinner } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/router';

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
    <Wrapper>
      <Formik initialValues={initialValues} onSubmit={onForgotPasswordSubmit}>
        {(props) => {
          const { handleSubmit, isSubmitting } = props;

          if (!loading && data) {
            return <Box>Please check your inbox</Box>;
          }

          return (
            <Form onSubmit={handleSubmit}>
              <InputField name="email" type="email" placeholder="email" label="Email" />

              <Button
                mt={4}
                type="submit"
                colorScheme="teal"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default ForgotPasswordPage;
