import Layout from '@/components/Layout';
import PostEditDeleteButtons from '@/components/PostEditDeleteButtons';
import { PostDocument, PostQuery, useMeQuery, usePostQuery } from '@/generated/graphql';
import { addApolloState, initializeApollo } from '@/lib/apolloClient';
import { Alert, Box, Flex, Heading, Spinner } from '@chakra-ui/react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

export const getStaticProps: GetStaticProps<
  { [key: string]: any },
  {
    id: string;
  }
> = async ({ params }) => {
  const apolloClient = initializeApollo();

  await apolloClient.query<PostQuery>({
    query: PostDocument,
    variables: {
      id: params?.id,
    },
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

const PostPage = () => {
  const { data: meData } = useMeQuery();
  const router = useRouter();
  const { data, loading, error } = usePostQuery({
    variables: {
      id: router.query.id as string,
    },
  });

  if (loading) {
    return (
      <Layout>
        <Flex justifyContent="center">
          <Spinner />
        </Flex>
      </Layout>
    );
  }

  if (error || !data?.post) {
    return (
      <Layout>
        <Alert status="error">{error ? error.message : 'Post not found'}</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      <Box>{data.post.text}</Box>

      {meData?.me?.id === data.post.user.id && (
        <Box mt={4}>
          <PostEditDeleteButtons postId={data.post.id} />
        </Box>
      )}
    </Layout>
  );
};

export default PostPage;
