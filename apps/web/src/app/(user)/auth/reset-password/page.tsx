import { exchangeToken } from '@/actions/exchange-token';
import { VerificationIdentifier } from '@/lib/enums';
import { notFound } from 'next/navigation';
import SetPasswordForm from './form';

type Props = {
  searchParams: {
    token?: string;
    intend?: string;
  };
};

export default async function ResetPassword({ searchParams }: Props) {
  if (!searchParams.intend) notFound();
  if (
    searchParams.intend !== VerificationIdentifier.ResetPassword &&
    searchParams.intend !== VerificationIdentifier.AnonymusSignin &&
    searchParams.intend !== VerificationIdentifier.NewPassword
  ) {
    notFound();
  }
  const token = await exchangeToken({
    identifier: searchParams.intend,
    token: searchParams.token,
  });

  return (
    <div>
      <SetPasswordForm token={token} intend={searchParams.intend} />
    </div>
  );
}
