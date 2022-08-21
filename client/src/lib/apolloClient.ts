/*  
  - Example nextjs with apollo client: https://github.com/vercel/next.js/blob/canary/examples/with-apollo/lib/apolloClient.js 
  - Setup nextjs with apollo ssr cookies and typescript: https://www.rockyourcode.com/nextjs-with-apollo-ssr-cookies-and-typescript/ 
*/
import { Post } from '@/generated/graphql';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import fetch from 'isomorphic-unfetch';
import merge from 'deepmerge';
import { IncomingHttpHeaders } from 'http';
import isEqual from 'lodash/isEqual';
import { useMemo } from 'react';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

let apolloClient: ApolloClient<NormalizedCacheObject>;

interface ApolloStateProps {
  [APOLLO_STATE_PROP_NAME]?: NormalizedCacheObject;
}

function createApolloClient(headers: IncomingHttpHeaders | null = null) {
  // isomorphic fetch for passing the cookies along with each GraphQL request
  const enhancedFetch = (url: RequestInfo, init: RequestInit) => {
    return fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        'Access-Control-Allow-Origin': '*',
        // here we pass the cookie along for each request
        Cookie: headers?.cookie ?? '',
      },
    });
  };

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: new HttpLink({
      uri: 'http://localhost:4000/graphql', // Server URL (must be absolute)

      /*
        ! must have to get cookie from server
        Additional fetch() options like `credentials` or `headers`
      */
      credentials: 'include',
      fetch: enhancedFetch,
    }),
    cache: new InMemoryCache({
      typePolicies: {
        /*
          `Query` here is taken from `__typename` in apollo cache tab 
          Doc: https://www.apollographql.com/docs/react/caching/cache-configuration/#typepolicy-fields 
        */
        Query: {
          fields: {
            posts: {
              // handle cache for query `posts` field
              keyArgs: false,
              merge(existing, incoming) {
                // console.log('Cache posts InMemoryCache', {
                //   existing,
                //   incoming,
                // });

                let paginatedPosts: Post[] = [];

                if (existing && existing.paginatedPosts) {
                  paginatedPosts = paginatedPosts.concat(existing.paginatedPosts);
                }

                if (incoming && incoming.paginatedPosts) {
                  paginatedPosts = paginatedPosts.concat(incoming.paginatedPosts);
                }

                return { ...incoming, paginatedPosts };
              },
            },
          },
        },
      },
    }),
  });
}

export function initializeApollo(
  inputParam: {
    headers?: IncomingHttpHeaders | null;
    initialState?: NormalizedCacheObject | null;
  } = {
    headers: null,
    initialState: null,
  },
) {
  const { headers, initialState } = inputParam;
  const _apolloClient = apolloClient ?? createApolloClient(headers);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the initialState from getStaticProps/getServerSideProps in the existing cache
    const data = merge(existingCache, initialState, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) => sourceArray.every((s) => !isEqual(d, s))),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: {
    props: ApolloStateProps;
  },
) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function useApollo(pageProps: ApolloStateProps) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(
    () =>
      initializeApollo({
        initialState: state,
      }),
    [state],
  );
  return store;
}
