import {
  MeDocument,
  MeQuery,
  PostWithUserInfoFragment,
  useLogoutMutation,
  useMeQuery,
} from '@/generated/graphql';
import { initializeApollo } from '@/lib/apolloClient';
import { gql, Reference } from '@apollo/client';
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import NextLink from 'next/link';

const Navbar = () => {
  const { data, loading } = useMeQuery();
  const [logout, { loading: logoutLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    await logout({
      update(cache, { data }) {
        if (!data?.logout) return;

        cache.writeQuery<MeQuery>({
          query: MeDocument,
          data: {
            me: null,
          },
        });

        cache.modify({
          fields: {
            posts(existing) {
              existing.paginatedPosts.forEach((post: Reference) => {
                cache.writeFragment({
                  id: post.__ref,
                  fragment: gql`
                    fragment VoteType on Post {
                      voteType
                    }
                  `,
                  data: {
                    voteType: 0,
                  },
                });
              });
            },
          },
        });
      },
    });
  };

  let body = null;
  if (!loading) {
    if (data?.me?.id) {
      body = (
        <>
          <NextLink href="/create-post" passHref>
            <Button as="a" mr={2}>
              Create post
            </Button>
          </NextLink>

          <Button
            onClick={handleLogout}
            isLoading={logoutLoading}
            isDisabled={logoutLoading}
          >
            Logout
          </Button>
        </>
      );
    } else {
      body = (
        <>
          <NextLink href="/login" passHref>
            <Link mr={2}>Login</Link>
          </NextLink>

          <NextLink href="/register" passHref>
            <Link>Register</Link>
          </NextLink>
        </>
      );
    }
  }

  return (
    <Box bg="tan">
      <Flex
        maxW={768}
        justifyContent="space-between"
        alignItems="center"
        mx="auto"
        py={3}
      >
        <Heading>
          <NextLink href="/" passHref>
            <Link>Reddit</Link>
          </NextLink>
        </Heading>
        <Box>{body}</Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
