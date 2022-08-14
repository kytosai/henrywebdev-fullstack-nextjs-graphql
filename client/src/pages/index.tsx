import Layout from '@/components/Layout';
import { PostsDocument, usePostsQuery } from '@/generated/graphql';
import { addApolloState, initializeApollo } from '@/lib/apolloClient';
import { Box, Flex, Heading, Link, Spinner, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

export const getStaticProps = async () => {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: PostsDocument,
  });

  return addApolloState(apolloClient, {
    props: {},
  });
};

const HomePage = () => {
  const { data, loading } = usePostsQuery();

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
        {data?.posts.map((post) => {
          return (
            <Flex key={post.id} shadow="md" p={4} borderWidth={1}>
              <Box>
                <NextLink href={`/post/${post.id}`} passHref>
                  <Link>
                    <Heading fontSize="xl">{post.title}</Heading>
                  </Link>
                </NextLink>

                <Text>posted by Author</Text>

                <Flex align="center" mt={4}>
                  <Text>{post.textSnippet}</Text>
                  <Box ml="auto">EDIT Button</Box>
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
