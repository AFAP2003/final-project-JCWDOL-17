'use client';

import InputFormItemFloating from '@/components/input-form-item-floating';
import TextareaFormItemFloating from '@/components/textarea-form-item-floating';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { apiclient } from '@/lib/apiclient';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Loader2, Map, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounceValue, useIsClient } from 'usehooks-ts';
import { z } from 'zod';
// import AddressMap from './address-map';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/lib/auth/client';
import { parseBasicObjZodError } from '@/lib/parse-zod-error';
import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import AddressCard from './address-card';
import SearchBox from './search-box';

const AddressMap = dynamic(() => import('./address-map'), {
  ssr: false,
});

const formSchema = z.object({
  label: z.string().trim().min(4, 'Required, min of 4 character long').max(50),

  address: z
    .string()
    .trim()
    .min(10, 'Required, min of 10 character long')
    .max(200),

  province: z
    .string()
    .trim()
    .min(4, 'Required, min of 5 character long')
    .max(30),

  city: z.string().trim().min(4, 'Required, min of 4 character long').max(30),

  postalCode: z.string().regex(/^\d{5}$/, {
    message: 'Required and must be 5 digit number',
  }),

  isPrimary: z.boolean(),

  latitude: z
    .number()
    .min(-90, { message: 'Latitude must be >= -90' })
    .max(90, { message: 'Latitude must be <= 90' }),

  longitude: z
    .number()
    .min(-180, { message: 'Longitude must be >= -180' })
    .max(180, { message: 'Longitude must be <= 180' }),

  recipient: z
    .string()
    .trim()
    .min(3, 'Required, min of 3 character long')
    .max(30),

  phone: z
    .string()
    .trim()
    .regex(/^(?:\+62|62|0)8[1-9][0-9]{6,10}$/, {
      message: 'Invalid phone number',
    }),
});

export default function TabContentAddress() {
  const [openDialog, setOpenDialog] = useState(false);
  const [action, setAction] = useState<'create' | 'update'>('create');
  const [addressId, setAddressId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isClient = useIsClient();
  const [search, setSearch] = useState('');
  const [dbSearch] = useDebounceValue(search.trim(), 500);
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      isPrimary: false,
      recipient: '',
      phone: '',
      latitude: -7.027455, // TODO:
      longitude: 110.4134411, // TODO:
    },
  });

  const { mutate: mutateAddress, isPending: mutatePending } = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      if (action === 'create') {
        const { data } = await apiclient.post('/user/address', payload);
        return data;
      }
      if (action === 'update') {
        const { data } = await apiclient.put(
          `/user/address/${addressId}`,
          payload,
        );
        return data;
      }
    },
    onSuccess: () => {
      toast({
        description:
          action === 'create'
            ? 'A new address has been successfully added.'
            : 'The address has been successfully updated.',
      });
      setOpenDialog(false);
      setAddressId(null);
      form.reset();
      refetchGet();
    },

    onError: (error: AxiosError) => {
      const response = error.response?.data as { error: { message: string } };
      const message = response?.error?.message;

      if (error.status! === 422) {
        const parsederror = parseBasicObjZodError(error);
        parsederror.forEach((err) => form.setError(err.key, err.value));
        return;
      }

      if (
        error.status! === 400 &&
        message.startsWith('Address limit exceeded')
      ) {
        toast({
          description:
            'Cannot create new address. Limit exceeded of 100 address in total',
          variant: 'destructive',
        });
        return;
      }

      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },
  });

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
      form.reset();
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

  return (
    <>
      {isClient && (
        <Dialog
          open={openDialog}
          onOpenChange={(val) => {
            if (val === false) {
              form.reset();
            }
            setOpenDialog(val);
          }}
        >
          <DialogContent className="max-w-4xl border-neutral-500 bg-neutral-800 text-neutral-200">
            <DialogHeader />
            <DialogDescription />

            <DialogTitle className="text-xl font-bold flex w-full justify-center items-center gap-x-4">
              <Map className="size-8" /> <span>Tell Us Your Address</span>
            </DialogTitle>

            <Separator className="bg-neutral-500 mb-3" />

            <ScrollArea className="max-h-[500px] px-6">
              <Form {...form}>
                <form
                  ref={formRef}
                  className="py-6"
                  onSubmit={form.handleSubmit((data) => {
                    mutateAddress(data);
                  })}
                >
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <InputFormItemFloating
                        field={field}
                        id="label"
                        label="Label Address"
                        showCount
                        maxCount={50}
                        withSuggestion={false}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <TextareaFormItemFloating
                        field={field}
                        id="address"
                        label="Full Address"
                        showCount
                        maxCount={200}
                        inputClass="h-[130px]"
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <InputFormItemFloating
                        field={field}
                        id="city"
                        label="City"
                        showCount={true}
                        maxCount={30}
                        withSuggestion={true}
                        suggestionFetchFn={async (val) => {
                          try {
                            const { data } = await apiclient.get(
                              `/location/city?name=${val}&pageSize=5`,
                            );
                            return data.cities as {
                              cityName: string;
                              cityType: string;
                            }[];
                          } catch (error) {
                            return [];
                          }
                        }}
                        suggestionItem={(item) => `${item.cityName}`}
                        onSuggestionSelect={(item) => {
                          form.setValue('city', `${item.cityName}`);
                        }}
                        debounce={500}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <InputFormItemFloating
                        field={field}
                        id="province"
                        label="Province"
                        showCount={true}
                        maxCount={30}
                        withSuggestion={true}
                        suggestionFetchFn={async (val) => {
                          try {
                            const { data } = await apiclient.get(
                              `/location/province?name=${val}&pageSize=5`,
                            );
                            return data.provinces as {
                              provinceName: string;
                            }[];
                          } catch (error) {
                            return [];
                          }
                        }}
                        suggestionItem={(item) => `${item.provinceName}`}
                        onSuggestionSelect={(item) => {
                          form.setValue('province', `${item.provinceName}`);
                        }}
                        debounce={500}
                      />
                    )}
                  />

                  <div className="flex gap-8 lg:gap-16 items-center w-full">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <div className="grow max-w-[280px]">
                          <InputFormItemFloating
                            field={field}
                            id="postalCode"
                            label="Postal Code"
                            showCount={false}
                            withSuggestion={false}
                          />
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isPrimary"
                      render={({ field }) => (
                        <div className="relative bottom-3 flex items-center space-x-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="isPrimary"
                            className="data-[state=checked]:bg-neutral-700"
                          />
                          <Label
                            className="text-sm font-medium"
                            htmlFor="isPrimary"
                          >
                            Use As Primary
                          </Label>
                        </div>
                      )}
                    />
                  </div>

                  <AddressMap
                    initialPosition={{
                      lat: form.getValues('latitude'),
                      lng: form.getValues('longitude'),
                    }}
                    onLocationChange={(loc) => {
                      if (loc) {
                        form.setValue('latitude', loc.latitude);
                        form.setValue('longitude', loc.longitude);
                      }
                    }}
                  />

                  <Separator className="my-12 bg-neutral-500 h-1" />

                  <FormField
                    control={form.control}
                    name="recipient"
                    render={({ field }) => (
                      <InputFormItemFloating
                        field={field}
                        id="recipient"
                        label="Recipient Name"
                        showCount
                        maxCount={50}
                        withSuggestion={false}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <InputFormItemFloating
                        field={field}
                        id="phone"
                        label="Phone Number"
                        showCount={false}
                        withSuggestion={false}
                      />
                    )}
                  />
                </form>
              </Form>
            </ScrollArea>

            <Separator className="bg-neutral-500 mb-3" />

            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  formRef.current?.requestSubmit();
                }}
                className="text-sm sm:text-sm bg-neutral-700 hover:bg-neutral-700/90"
              >
                Save Address
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Card className="p-6">
        <div className="w-full">
          <div className="flex w-full justify-between mb-8 gap-12">
            <SearchBox search={search} setSearch={setSearch} />
            <Button
              disabled={mutatePending}
              onClick={() => {
                setOpenDialog(true);
                setAction('create');
                setAddressId(null);
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
                <div className="text-neutral-400 text-center text-base max-w-sm mx-auto">
                  📭 No addresses have been added yet. Please add one to
                  simplify your delivery process.
                </div>
              </div>
            )}

            {addresses?.length === 0 && dbSearch && (
              <div className="w-full h-[370px] flex items-center">
                <div className="text-neutral-400 text-center text-base max-w-sm mx-auto">
                  🔍 No result found for current filter.
                </div>
              </div>
            )}

            {getPending && (
              <div className="w-full h-[370px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center text-neutral-400">
                  <Loader2 className="w-8 h-8 mb-2 animate-spin text-neutral-400" />
                  <span className="text-base">Searching for addresses...</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {addresses?.map((a) => (
                <AddressCard
                  disabled={deletePending}
                  key={a.id}
                  address={a}
                  onEdit={(address) => {
                    form.setValue('label', address.label);
                    form.setValue('address', address.address);
                    form.setValue('province', address.province);
                    form.setValue('city', address.city);
                    form.setValue('postalCode', address.postalCode);
                    form.setValue(
                      'isPrimary',
                      address.isDefault ? true : false,
                    );
                    form.setValue('latitude', address.latitude);
                    form.setValue('longitude', address.longitude);
                    form.setValue('recipient', address.recipient);
                    form.setValue('phone', address.phone);
                    setOpenDialog(true);
                    setAction('update');
                    setAddressId(a.id);
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
