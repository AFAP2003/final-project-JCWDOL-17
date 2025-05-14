import SigninForm from './form';

type Props = {
  searchParams: {
    role?: string;
  };
};

export default function SigninPage({ searchParams }: Props) {
  return (
    <div className="size-full">
      <SigninForm role={searchParams.role} />
    </div>
  );
}
