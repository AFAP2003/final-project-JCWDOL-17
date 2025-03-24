import IdentityForm from './form';

type Props = {
  searchParams: {
    token: string;
  };
};

export default async function IdentityPage({ searchParams }: Props) {
  return (
    <div>
      <IdentityForm token={searchParams.token} />
    </div>
  );
}
