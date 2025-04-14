import { apiclient } from '@/lib/apiclient';
import { VerificationIdentifier } from '@/lib/enums';
import { notFound } from 'next/navigation';

export async function exchangeToken({
  identifier,
  token,
}: {
  identifier: VerificationIdentifier;
  token?: string;
}) {
  if (!token) notFound();

  let data: any;
  try {
    const { data: result } = await apiclient.post('/token/exchange', {
      identifier: identifier,
      token: token,
    });
    data = result;
  } catch (error) {
    notFound();
  }

  if (!data.token) notFound();
  return data.token as string;
}
