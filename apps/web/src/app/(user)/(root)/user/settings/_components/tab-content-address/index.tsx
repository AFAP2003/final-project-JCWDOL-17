'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useDebounceValue, useIsClient } from 'usehooks-ts';
import AddressCard from './address-card';
import DialogForm from './dialog-form';
import LoadingSkeleton from './loading-skeleton';
import SearchBox from './search-box';

export default function TabContentAddress() {
  const [openDialog, setOpenDialog] = useState(false);

  const [action, setAction] = useState<'create' | 'update'>('create');

  const [initialValue, setInitialValue] = useState<{
    label: string;
    address: string;
    province: string;
    city: string;
    postalCode: string;
    isPrimary: boolean;
    latitude: number;
    longitude: number;
    recipient: string;
    phone: string;
    addressId: string;
  } | null>(null);

  const isClient = useIsClient();
  const [search, setSearch] = useState('');
  const [dbSearch] = useDebounceValue(search.trim(), 500);
  const { data: session } = useSession();

  const { mutate: deleteAddress, isPending: deletePending } = useMutation({
    mutationFn: async (payload: { addressId: string }) => {
      const { data } = await apiclient.delete(
        `/user/address/${payload.addressId}`,
      );
      return data;
    },
    onSuccess: () => {
      toast({
        description: 'The address has been successfully removed.',
      });
      // form.reset();
      refetchGet();
    },

    onError: (error: AxiosError) => {
      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },
  });

  const {
    data: addresses,
    isPending: getPending,
    refetch: refetchGet,
  } = useQuery({
    queryKey: ['user/settings', 'list-address', dbSearch],
    queryFn: async () => {
      const { data } = await apiclient.get<GetAllAddressResponse>(
        `/user/address?query=${dbSearch}&pageSize=100`,
      );
      return data.addresses;
    },
    enabled: !!session?.user,
  });

  if (getPending) return <LoadingSkeleton />;

  return (
    <>
      {isClient && (
        <DialogForm
          open={openDialog}
          onOpenChange={setOpenDialog}
          action={action}
          onMutateSuccess={() => {
            refetchGet();
            setOpenDialog(false);
          }}
          initialValue={initialValue}
        />
      )}

      <Card className="p-6">
        <div className="w-full min-h-[485px]">
          <div className="flex sm:flex-row flex-col-reverse w-full justify-between mb-8 gap-6 sm:gap-12">
            <SearchBox search={search} setSearch={setSearch} />
            <Button
              onClick={() => {
                setOpenDialog(true);
                setAction('create');
              }}
              className="bg-neutral-800/90 hover:bg-neutral-800/90 text-neutral-200 hover:text-neutral-300 transition-all duration-300"
            >
              <Plus className="size-4" />
              New Address
            </Button>
          </div>

          <div className="py-6">
            {addresses?.length === 0 && !dbSearch && (
              <div className="w-full h-[370px] flex items-center">
                <div className="text-neutral-400 italic text-center text-base max-w-sm mx-auto">
                  📭 No addresses have been added yet. Please add one to
                  simplify your delivery process.
                </div>
              </div>
            )}

            {addresses?.length === 0 && dbSearch && (
              <div className="w-full h-[370px] flex items-center">
                <div className="text-neutral-400 italic text-center text-base max-w-sm mx-auto">
                  🔍 No result found for current filter.
                </div>
              </div>
            )}

            <div className="space-y-6">
              {addresses?.map((address, idx) => (
                <AddressCard
                  disabled={deletePending}
                  key={address.id}
                  address={address}
                  onEdit={(address) => {
                    setInitialValue({
                      ...address,
                      addressId: address.id,
                      isPrimary: address.isDefault ? true : false,
                    });
                    setOpenDialog(true);
                    setAction('update');
                  }}
                  onDelete={(address) => {
                    deleteAddress({
                      addressId: address.id,
                    });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
