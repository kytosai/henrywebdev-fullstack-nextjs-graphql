import { useApollo } from '@/lib/apolloClient';
import theme from '@/theme';
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  console.log({ pageProps });

  const apolloClient = useApollo(pageProps);

  return (
    <ChakraProvider theme={theme}>
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    </ChakraProvider>
  );
}

export default MyApp;
