import { Card } from '@/components/ui/card';
import SignupForm from './form';

export default function SignupPage() {
  return (
    <div className="size-full">
      <Card className="size-full shadow-md overflow-hidden py-8 relative">
        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-primary to-primary/60"></div>

        <div className="flex flex-row justify-center items-center size-full gap-8">
          <div className="flex size-full items-center justify-center max-lg:hidden">
            <div className="w-full max-w-md">
              <div className="text-center">[MARKETING]</div>
            </div>
          </div>
          <SignupForm />
        </div>
      </Card>
    </div>
  );
}
