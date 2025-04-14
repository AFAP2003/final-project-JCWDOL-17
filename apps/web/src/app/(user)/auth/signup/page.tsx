import SignupForm from './form';

type Props = {
  searchParams: {
    error?: string;
  };
};

export default function SignupPage({ searchParams }: Props) {
  return (
    <div className="size-full">
      <SignupForm searchParams={searchParams} />
    </div>
  );
}
