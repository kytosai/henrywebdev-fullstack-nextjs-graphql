import Layout from '@/components/Layout';
import { PostDocument, PostQuery, usePostQuery } from '@/generated/graphql';
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
  const router = useRouter();
  const { data, loading, error } = usePostQuery({
    variables: {
      id: router.query.id as string,
    },
  });

  if (error || !data?.post) {
    return (
      <Layout>
        <Alert status="error">{error ? error.message : 'Post not found'}</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      {loading ? (
        <Flex justifyContent="center">
          <Spinner />
        </Flex>
      ) : (
        <>
          <Heading mb={4}>{data.post.title}</Heading>
          <Box>{data.post.text}</Box>
        </>
      )}
    </Layout>
  );
};

export default PostPage;
