import SigninForm from './form';

type Props = {
  searchParams: {
    error?: string;
  };
};

export default function SigninPage({ searchParams }: Props) {
  return (
    <div className="size-full">
      <SigninForm searchParams={searchParams} />
    </div>
  );
}
