'use client';

import InputFormItemFloating from '@/components/input-form-item-floating';
import TextareaFormItemFloating from '@/components/textarea-form-item-floating';
import { Button } from '@/components/ui/button';
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
import { useLocation } from '@/context/location-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { parseBasicObjZodError } from '@/lib/parse-zod-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Map } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

type Props = {
  open: boolean;
  action: 'create' | 'update';
  onOpenChange: (val: boolean) => void;
  onMutateSuccess: () => void;
  initialValue: (z.infer<typeof formSchema> & { addressId: string }) | null;
};

export default function DialogForm(props: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const { data: location } = useLocation();
  //   const isInitialRender = useRef(true);

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
      latitude: 0,
      longitude: 0,
    },
  });

  const { mutate: mutateAddress, isPending: mutatePending } = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      if (props.action === 'create') {
        const { data } = await apiclient.post('/user/address', payload);
        return data;
      }
      if (props.action === 'update') {
        const { data } = await apiclient.put(
          `/user/address/${props.initialValue?.addressId}`,
          payload,
        );
        return data;
      }
    },
    onSuccess: () => {
      toast({
        description:
          props.action === 'create'
            ? 'A new address has been successfully added.'
            : 'The address has been successfully updated.',
      });
      form.reset();
      props.onMutateSuccess();
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

  useEffect(() => {
    if (props.initialValue) {
      form.setValue('label', props.initialValue.label);
      form.setValue('address', props.initialValue.address);
      form.setValue('province', props.initialValue.province);
      form.setValue('city', props.initialValue.city);
      form.setValue('postalCode', props.initialValue.postalCode);
      form.setValue('isPrimary', props.initialValue.isPrimary);
      form.setValue('latitude', props.initialValue.latitude);
      form.setValue('longitude', props.initialValue.longitude);
      form.setValue('recipient', props.initialValue.recipient);
      form.setValue('phone', props.initialValue.phone);
    }
  }, [props.initialValue]);

  return (
    <Dialog
      open={props.open}
      onOpenChange={(val) => {
        if (val === false) {
          form.reset();
        }
        props.onOpenChange(val);
      }}
    >
      <DialogContent
        id="prevent-lenis"
        className="max-w-4xl border-neutral-500 bg-neutral-800 text-neutral-200"
      >
        <DialogHeader />
        <DialogDescription />

        <DialogTitle className="text-xl font-bold flex w-full justify-center items-center gap-x-4">
          <Map className="size-8" />{' '}
          <span>
            {props.action === 'create' ? 'Buat Alamat Baru' : 'Edit Alamat'}
          </span>
        </DialogTitle>

        <Separator className="bg-neutral-500 mb-3" />

        <ScrollArea className="sm:h-[600px] h-[360px] sm:px-12">
          <Form {...form}>
            <form
              ref={formRef}
              onSubmit={form.handleSubmit((data) => {
                mutateAddress(data);
              })}
            >
              <div className="py-6 pt-3">
                <AddressMap
                  initialPosition={(() => {
                    const initialpoint: { lat: number; lng: number } = {
                      lat: -6.175205678767613,
                      lng: 106.82716967509717,
                    };
                    if (props.action === 'update') {
                      initialpoint.lat = props.initialValue!.latitude;
                      initialpoint.lng = props.initialValue!.longitude;
                    } else if (location) {
                      initialpoint.lat = location.latitude;
                      initialpoint.lng = location.longitude;
                    }
                    return initialpoint;
                  })()}
                  onLocationChange={(loc, isInitial) => {
                    if (isInitial && props.action === 'update') {
                      return;
                    } else if (loc) {
                      form.setValue('label', loc.name || '');
                      form.setValue('address', loc.address);
                      form.setValue('city', loc.city || '');
                      form.setValue('province', loc.province || '');
                      form.setValue('postalCode', loc.postalCode || '');
                      form.setValue('latitude', loc.latitude);
                      form.setValue('longitude', loc.longitude);
                    }
                  }}
                />
              </div>

              <Separator className="my-6 bg-neutral-500 h-1" />

              <div className="py-6 space-y-6">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <InputFormItemFloating
                      field={field as any}
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

                <div className="flex  gap-8 lg:gap-16 items-center w-full">
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
              </div>

              <Separator className="my-6 bg-neutral-500 h-1" />

              <div className="py-6 space-y-6">
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
              </div>
            </form>
          </Form>
        </ScrollArea>

        <Separator className="bg-neutral-500 mb-3" />

        <DialogFooter>
          <Button
            type="button"
            disabled={mutatePending}
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
  );
}
