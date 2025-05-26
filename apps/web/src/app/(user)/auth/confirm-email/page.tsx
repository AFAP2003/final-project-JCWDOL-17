import { exchangeToken } from '@/actions/exchange-token';
import { VerificationIdentifier } from '@/lib/enums';
import Confirm from './confirm';

type Props = {
  searchParams: {
    token?: string;
  };
};

export default async function ConfirmEmailPage({ searchParams }: Props) {
  const token = await exchangeToken({
    identifier: VerificationIdentifier.ResetEmail,
    token: searchParams?.token,
  });

  return (
    <div>
      <Confirm token={token} />
    </div>
  );
}
