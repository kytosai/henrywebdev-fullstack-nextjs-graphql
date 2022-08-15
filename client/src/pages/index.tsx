import Layout from '@/components/Layout';
import PostEditDeleteButtons from '@/components/PostEditDeleteButtons';
import { PostsDocument, usePostsQuery } from '@/generated/graphql';
import { addApolloState, initializeApollo } from '@/lib/apolloClient';
import { NetworkStatus } from '@apollo/client';
import { Box, Button, Flex, Heading, Link, Spinner, Stack, Text } from '@chakra-ui/react';
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
  const { data, loading, error, fetchMore, networkStatus } = usePostsQuery({
    variables: {
      limit,
    },

    /*
      Component render by posts query will re-render when networkStatus change. Means when `fetchMore` run
    */
    notifyOnNetworkStatusChange: true,
  });

  console.log({
    networkStatus,
  });

  const loadingMorePosts = networkStatus === NetworkStatus.fetchMore;

  const loadMorePosts = async () => {
    fetchMore({
      variables: {
        limit,
        cursor: data?.posts?.cursor,
      },
    });
  };

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

      {data?.posts?.hasMore && (
        <Flex justifyContent="center" mt={4}>
          <Button mx="auto" isLoading={loadingMorePosts} onClick={loadMorePosts}>
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default HomePage;
