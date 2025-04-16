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
import { TabsContent } from '@/components/ui/tabs';
import { apiclient } from '@/lib/apiclient';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Map, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIsClient } from 'usehooks-ts';
import { z } from 'zod';
// import AddressMap from './address-map';
import dynamic from 'next/dynamic';
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

  receipent: z
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
  const formRef = useRef<HTMLFormElement>(null);
  const isClient = useIsClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      isPrimary: false,
      receipent: '',
      phone: '',
      latitude: 0, // tambahkan ini
      longitude: 0, // tambahkan ini
    },
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
          <DialogContent className="max-w-4xl">
            <DialogHeader />
            <DialogDescription />

            <DialogTitle className="text-xl text-neutral-800 font-bold flex w-full justify-center items-center gap-x-4">
              <Map className="text-green-500 size-8" />{' '}
              <span>Tell Us Your Address</span>
            </DialogTitle>
            <Separator className="bg-neutral-500 mb-2" />

            <ScrollArea className="max-h-[500px] px-4">
              <Form {...form}>
                <form
                  ref={formRef}
                  className="py-2"
                  onSubmit={form.handleSubmit((data) => {
                    console.log({ data });
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
                              `/region/city?name=${val}&pageSize=5`,
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
                              `/region/province?name=${val}&pageSize=5`,
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

                    <div className="relative bottom-3 flex items-center space-x-2">
                      <Switch
                        onCheckedChange={(val) =>
                          form.setValue('isPrimary', val)
                        }
                        id="isPrimary"
                        className="data-[state=checked]:bg-green-500"
                      />
                      <Label
                        className="text-sm font-medium text-neutral-700"
                        htmlFor="isPrimary"
                      >
                        Use As Primary
                      </Label>
                    </div>
                  </div>

                  <AddressMap
                    initialPosition={{
                      lat: -7.027455,
                      lng: 110.4134411,
                    }}
                    onLocationChange={(loc) => {
                      if (loc) {
                        form.setValue('latitude', loc.latitude);
                        form.setValue('longitude', loc.longitude);
                      }
                    }}
                  />

                  <Separator className="my-6 bg-neutral-300 h-1" />

                  <FormField
                    control={form.control}
                    name="receipent"
                    render={({ field }) => (
                      <InputFormItemFloating
                        field={field}
                        id="receipent"
                        label="Receipent Name"
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

            <Separator className="bg-neutral-500 mb-2" />
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  formRef.current?.requestSubmit();
                }}
                className="text-sm sm:text-sm bg-green-600 hover:bg-green-700"
              >
                Save Address
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <TabsContent value="address">
        <Card className="p-6">
          <div className="w-full">
            <div className="flex w-full justify-between mb-8 gap-12">
              <SearchBox />
              <Button
                onClick={() => setOpenDialog(true)}
                className="bg-green-600 hover:bg-green-700 transition-all duration-300"
              >
                <Plus className="size-4" />
                New Address
              </Button>
            </div>

            <div>[Address List]</div>
          </div>
        </Card>
      </TabsContent>
    </>
  );
}
