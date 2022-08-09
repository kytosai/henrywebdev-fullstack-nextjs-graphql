import { Box, Flex, Heading, Link } from '@chakra-ui/react';
import NextLink from 'next/link';

const Navbar = () => {
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
        <Box>
          <NextLink href="/login" passHref>
            <Link mr={2}>Login</Link>
          </NextLink>

          <NextLink href="/register" passHref>
            <Link>Register</Link>
          </NextLink>
        </Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
