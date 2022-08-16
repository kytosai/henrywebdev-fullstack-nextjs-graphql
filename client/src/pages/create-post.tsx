import InputField from '@/components/InputField';
import Layout from '@/components/Layout';
import { CreatePostInput, useCreatePostMutation } from '@/generated/graphql';
import { useCheckAuth } from '@/utils/useCheckAuth';
import { Box, Button, Flex, Link, Spinner, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

const CreatePostPage = () => {
  const router = useRouter();
  const { data: authData, loading: authLoading } = useCheckAuth();
  const [createPost, { data, error }] = useCreatePostMutation();
  const toast = useToast();

  const initialValues: CreatePostInput = {
    title: 'post ',
    text: 'post ',
  };

  const onCreatePostSubmit = async (
    values: CreatePostInput,
    { setErrors }: FormikHelpers<CreatePostInput>,
  ) => {
    try {
      const resp = await createPost({
        variables: {
          createPostInput: values,
        },
        // update(cache, { data }) {
        //   cache.modify({
        //     fields: {
        //       posts(existing) {
        //         console.log('Cache post in createPost', {
        //           existing,
        //         });

        //         if (data?.createPost.success && data?.createPost.post) {
        //           const newPostRef = cache.identify(data.createPost.post); // Ex: `Post:newId`

        //           const newPostsAfterCreation = {
        //             ...existing,
        //             totalCount: existing.totalCount + 1,
        //             paginatedPosts: [
        //               { __ref: newPostRef },
        //               ...existing.paginatedPosts, // Ex: [{__ref: 'Post:1'},{__ref: 'Post:2'}]
        //             ],
        //           };

        //           return newPostsAfterCreation;
        //         } // endif
        //       },
        //     },
        //   });
        // },
      });

      if (resp.data?.createPost.success) {
        router.push('/');
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (authLoading || (!authLoading && !authData?.me)) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Layout>
      <Formik initialValues={initialValues} onSubmit={onCreatePostSubmit}>
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
                  Create
                </Button>
              </Flex>
            </Form>
          );
        }}
      </Formik>
    </Layout>
  );
};

export default CreatePostPage;
