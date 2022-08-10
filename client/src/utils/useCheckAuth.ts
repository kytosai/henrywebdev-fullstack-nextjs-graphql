import { useMeQuery } from '@/generated/graphql';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useCheckAuth = () => {
  const router = useRouter();
  const { data, loading } = useMeQuery();

  useEffect(() => {
    if (
      data?.me &&
      !loading &&
      (router.route === '/login' || router.route === '/register')
    ) {
      router.replace('/');
    }
  }, [router.route, data?.me, loading]);

  return { data, loading };
};
