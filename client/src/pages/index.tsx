import Layout from '@/components/Layout';
import PostEditDeleteButtons from '@/components/PostEditDeleteButtons';
import { PostsDocument, usePostsQuery } from '@/generated/graphql';
import { addApolloState, initializeApollo } from '@/lib/apolloClient';
import { Box, Flex, Heading, Link, Spinner, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

const limit = 2;

export const getStaticProps = async () => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit,
    },
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

const HomePage = () => {
  const { data, loading } = usePostsQuery({
    variables: {
      limit,
    },
  });

  if (loading) {
    return (
      <Box textAlign="center">
        <Spinner />
      </Box>
    );
  }

  return (
    <Layout>
      <Stack spacing={4}>
        {data?.posts?.paginatedPosts.map((post) => {
          return (
            <Flex key={post.id} shadow="md" p={4} borderWidth={1}>
              <Box w="100%">
                <NextLink href={`/post/${post.id}`} passHref>
                  <Link>
                    <Heading fontSize="xl">{post.title}</Heading>
                  </Link>
                </NextLink>

                <Text>Posted by {post.user.username}</Text>

                <Flex align="center" mt={4}>
                  <Box flexGrow="">
                    <Text>{post.textSnippet}</Text>
                  </Box>

                  <Box ml="auto">
                    <PostEditDeleteButtons />
                  </Box>
                </Flex>
              </Box>
            </Flex>
          );
        })}
      </Stack>
    </Layout>
  );
};

export default HomePage;
