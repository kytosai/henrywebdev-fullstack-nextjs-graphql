import { useMeQuery } from '@/generated/graphql';
import { Box, Flex, Heading, Link } from '@chakra-ui/react';
import NextLink from 'next/link';

const Navbar = () => {
  const { data, loading } = useMeQuery();

  let body = null;
  if (!loading) {
    if (data?.me?.id) {
      body = (
        <>
          <NextLink href="/logout" passHref>
            <Link mr={2}>Logout</Link>
          </NextLink>
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
