import InputField from '@/components/InputField';
import Layout from '@/components/Layout';
import {
  UpdatePostInput,
  useMeQuery,
  usePostQuery,
  useUpdatePostMutation,
} from '@/generated/graphql';
import { Alert, Box, Button, Flex, Spinner, useToast } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';

const EditPostPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { data: meData, loading: meLoading } = useMeQuery();
  const {
    data: postData,
    loading,
    error,
  } = usePostQuery({
    variables: {
      id: router.query.id as string,
    },
  });
  const [updatePost] = useUpdatePostMutation();

  if (meLoading || loading) {
    return (
      <Layout>
        <Flex justifyContent="center">
          <Spinner />
        </Flex>
      </Layout>
    );
  }

  if (error || !postData?.post) {
    return (
      <Layout>
        <Alert status="error">{error ? error.message : 'Post not found'}</Alert>
      </Layout>
    );
  }

  if (meData?.me?.id !== postData?.post?.user.id) {
    return (
      <Layout>
        <Alert status="error">Unauthorized!</Alert>
      </Layout>
    );
  }

  const initialValues: Omit<UpdatePostInput, 'id'> = {
    title: postData.post.title,
    text: postData.post.text,
  };

  const onUpdatePostSubmit = async (values: Omit<UpdatePostInput, 'id'>) => {
    try {
      const resp = await updatePost({
        variables: {
          updatePostInput: {
            ...values,
            id: parseInt(router.query.id as string),
          },
        },
      });

      if (resp.data?.updatePost.success) {
        toast({
          status: 'success',
          title: 'Update success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        router.back();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <Formik initialValues={initialValues} onSubmit={onUpdatePostSubmit}>
        {(props) => {
          const { handleSubmit, isSubmitting } = props;

          return (
            <Form onSubmit={handleSubmit}>
              <InputField name="title" type="text" placeholder="title" label="Title" />

              <Box mt={4}>
                <InputField
                  textarea
                  name="text"
                  type="text"
                  placeholder="text"
                  label="Text"
                />
              </Box>

              <Flex mt={4} alignItems="center" justifyContent="space-between">
                <Button
                  type="submit"
                  colorScheme="teal"
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Save
                </Button>
              </Flex>
            </Form>
          );
        }}
      </Formik>
    </Layout>
  );
};

export default EditPostPage;
