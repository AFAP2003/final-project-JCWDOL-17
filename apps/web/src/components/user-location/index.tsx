import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useLocation } from '@/context/location-provider';
import { cn } from '@/lib/utils';
import { DialogTitle } from '@radix-ui/react-dialog';
import { ReactNode, useState } from 'react';
import CurrentLocationButton from './current-location-button';
import MyAddressButton from './my-address-button';
import SearchLocationButton from './search-location-button';
import SelectedLocation from './selected-location';

type Props = {
  children: ReactNode;
  modal?: boolean;
};

export default function UserLocation({ children, modal = true }: Props) {
  const { data: location } = useLocation({ fallbackAddress: true });
  const [rootDialogHidden, setRootDialogHidden] = useState(false);

  return (
    <Dialog modal={modal}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent
        id="root:dialog"
        className={cn(
          'bg-neutral-800 border-neutral-500 text-neutral-200',
          rootDialogHidden && 'opacity-0',
        )}
      >
        <DialogTitle className="hidden" />
        <DialogDescription className="hidden" />

        <div>
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Lagi di mana sekarang?
          </h3>
          <Separator className="bg-neutral-500 my-6" />

          <SelectedLocation location={location} />

          <div className="flex flex-col size-full gap-3">
            <MyAddressButton setRootDialogHidden={setRootDialogHidden} />
            <CurrentLocationButton setRootDialogHidden={setRootDialogHidden} />
            <SearchLocationButton setRootDialogHidden={setRootDialogHidden} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
