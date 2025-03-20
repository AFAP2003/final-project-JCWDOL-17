import MaxWidthWrapper from '@/components/max-width-wrapper';
import SignupForm from './form';

export default function SignupPage() {
  return (
    <MaxWidthWrapper className="h-screen">
      <div className="flex flex-row justify-center items-center size-full gap-8">
        <div className="flex size-full items-center justify-center max-lg:hidden">
          <div className="w-full max-w-md">
            <div className="text-center">[MARKETING]</div>
          </div>
        </div>
        <SignupForm />
      </div>
    </MaxWidthWrapper>
  );
}
