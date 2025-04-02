import { QueryClient } from '@tanstack/react-query';

export const queryclient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      gcTime: 0,
    },
  },
});

export const refetchNow = (querykey: string[]) => {
  querykey.forEach((key) => {
    queryclient.invalidateQueries({
      queryKey: [key],
    });
    queryclient.refetchQueries({
      queryKey: [key],
    });
  });
};
