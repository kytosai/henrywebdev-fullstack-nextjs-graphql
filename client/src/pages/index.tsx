import Navbar from '@/components/Navbar';
import { PostsDocument, usePostsQuery } from '@/generated/graphql';
import { addApolloState, initializeApollo } from '@/lib/apolloClient';
import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';

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

  if (!loading) {
    console.log({ data });
  }

  return (
    <>
      <Navbar />
      {data?.posts.map((item) => {
        return (
          <Box key={item.id}>
            <Box>{item.title}</Box>
          </Box>
        );
      })}
    </>
  );
};

export default HomePage;
