import { exchangeToken } from '@/actions/exchange-token';
import { VerificationIdentifier } from '@/lib/enums';
import SetPasswordForm from './form';

type Props = {
  searchParams: {
    token?: string;
  };
};

export default async function SetPasswordPage({ searchParams }: Props) {
  const token = await exchangeToken({
    identifier: VerificationIdentifier.SignupConfirmation,
    token: searchParams?.token,
  });

  return (
    <div>
      <SetPasswordForm token={token} />
    </div>
  );
}
