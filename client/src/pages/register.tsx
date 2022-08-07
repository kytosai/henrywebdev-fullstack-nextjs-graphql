import InputField from '@/components/InputField';
import Wrapper from '@/components/Wrapper';
import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { Form, Formik } from 'formik';

const RegisterPage = () => {
  return (
    <Wrapper>
      <Formik
        initialValues={{
          username: '',
          email: '',
          password: '',
        }}
        onSubmit={async (values) => {
          console.log({ values });
        }}
      >
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
