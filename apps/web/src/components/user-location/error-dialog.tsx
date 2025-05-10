import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
};

export default function ErrorDialog({
  open,
  onOpenChange,
  title,
  description,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="bg-neutral-800 border-neutral-500 text-neutral-200">
        <DialogTitle className="hidden"></DialogTitle>
        <DialogDescription className="hidden"></DialogDescription>

        <div className="flex flex-col items-center text-center mb-3 space-y-3">
          <h3 className="text-lg font-semibold text-neutral-200">{title}</h3>
          <p className="text-neutral-300">{description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
