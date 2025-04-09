import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { GetAllSessionResponse } from '@/lib/types/get-all-session-response';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useActiveSession() {
  const session = useSession();
  const fetchresult = useQuery({
    queryKey: ['user/settings', 'tab-content-security'],
    queryFn: async () => {
      const { data } = await apiclient.get('/auth/sessions');
      return data as GetAllSessionResponse;
    },
  });

  const isPending = fetchresult.isPending || session.isPending;
  const error = fetchresult.error || session.error;
  const refetch = useCallback(() => {
    return Promise.all([session.refetch(), fetchresult.refetch()]);
  }, [fetchresult, session]);

  return {
    sessions: fetchresult.data,
    current: session.data,
    isPending: isPending,
    error: error,
    refetch: refetch,
  };
}
