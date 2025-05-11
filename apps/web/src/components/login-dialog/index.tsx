import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
};

export default function LoginDialog(props: Props) {
  const router = useRouter();
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="bg-neutral-800 border-neutral-500 text-neutral-200">
        <DialogTitle className="hidden" />
        <DialogDescription className="hidden" />

        <div className="flex flex-col items-center text-center mb-3 space-y-3">
          <h3 className="text-lg font-semibold text-neutral-200">
            Ups! Kamu belum login.
          </h3>
          <p className="text-neutral-300">
            Login dulu yuk biar bisa lanjut belanja 😊
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-center gap-2">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push('/auth/signin');
            }}
            className={cn(
              'bg-neutral-700 hover:bg-neutral-700 text-neutral-200 hover:text-neutral-300',
              'transition-all duration-300 ease-in-out',
            )}
          >
            Login
          </Button>
          <Button
            variant="outline"
            onClick={props.onCancel}
            className={cn(
              'bg-neutral-100 hover:bg-neutral-100 text-neutral-700 hover:text-neutral-800 outline-neutral-100',
              'transition-all duration-300 ease-in-out',
            )}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
