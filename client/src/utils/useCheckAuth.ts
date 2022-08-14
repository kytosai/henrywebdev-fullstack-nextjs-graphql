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
      ['/login', '/register', '/change-password', '/forgot-password'].includes(
        router.route,
      )
    ) {
      router.replace('/');
    }
  }, [router.route, data?.me, loading]);

  return { data, loading };
};
