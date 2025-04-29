'use client';

import { useCurrentLocation } from '@/context/current-location-provider';
import { GeocodingResponse } from '@/lib/types/geocoding-response';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, MapPinned } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useGeolocated } from 'react-geolocated';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import InputFormItemFloating from '../input-form-item-floating';
import TextareaFormItemFloating from '../textarea-form-item-floating';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Form, FormField } from '../ui/form';
import { Separator } from '../ui/separator';
const Map = dynamic(() => import('../map'), {
  ssr: false,
});
// import Map from '../map';

const formSchema = z.object({
  label: z.string().trim().min(4, 'Required, min of 4 character long').max(50),
  address: z
    .string()
    .trim()
    .min(10, 'Required, min of 10 character long')
    .max(200),
});

type Props = {
  onDialogOpenChange?: (val: boolean) => void;
};

export default function PintPointButton(props: Props) {
  const { mutate: mutateLocation, data: location } = useCurrentLocation();
  const geo = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchLocationPermissionChange: true,
  });

  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      address: '',
    },
  });
  const [activeSection, setActiveSection] = useState<'map' | 'form'>('map');

  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    if (props.onDialogOpenChange) {
      props.onDialogOpenChange(dialogOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen]);

  const [pinnedLocation, setPinnedLocation] = useState<
    GeocodingResponse[number] | null
  >(null);

  return (
    <>
      <Button
        onClick={() => {
          setDialogOpen(true);
        }}
        className="flex w-full text-sm bg-neutral-700 text-neutral-200 hover:text-neutral-300 hover:bg-neutral-700"
      >
        <MapPinned />
        <span>Pinpoint Location</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
        <DialogTrigger asChild className="hidden"></DialogTrigger>

        <DialogContent className="bg-neutral-800 border-neutral-500 text-neutral-200 max-w-3xl">
          <DialogHeader className="text-neutral-200">
            <DialogTitle>Pinpoint Your Location</DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>

          <Separator className="bg-neutral-500 my-3" />

          <div className="px-3">
            <AnimatePresence initial={false}>
              {activeSection === 'map' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <Map
                    initialPosition={(() => {
                      const initialpoint: { lat: number; lng: number } = {
                        lat: -6.175205678767613,
                        lng: 106.82716967509717,
                      };
                      if (pinnedLocation) {
                        initialpoint.lat = pinnedLocation.latitude;
                        initialpoint.lng = pinnedLocation.longitude;
                      } else if (location) {
                        initialpoint.lat = location.location.latitude;
                        initialpoint.lng = location.location.longitude;
                      } else if (geo.coords) {
                        initialpoint.lat = geo.coords.latitude;
                        initialpoint.lng = geo.coords.longitude;
                      }
                      return initialpoint;
                    })()}
                    onLocationChange={(pinned) => {
                      setPinnedLocation(pinned);
                    }}
                  />

                  <div className="mt-6">
                    <div className="flex w-full gap-3">
                      <div className="grow bg-neutral-700 w-1"></div>
                      <div className="grow w-full">
                        <p className="text-base">{pinnedLocation?.name}</p>
                        <p className="text-sm text-neutral-300">
                          {pinnedLocation?.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle Button */}
            <div
              className={cn(
                'relative flex justify-center items-center text-neutral-200',
              )}
            >
              <div
                onClick={() =>
                  setActiveSection(activeSection === 'map' ? 'form' : 'map')
                }
                className="flex gap-1.5 justify-center items-center hover:text-neutral-300 hover:underline underline-offset-4 cursor-pointer transition-all text-sm"
              >
                {activeSection === 'map' ? (
                  <>
                    <p>Label location point</p>
                    <ChevronUp className="shrink-0 size-5" />
                  </>
                ) : (
                  <>
                    <p>Set location point</p>
                    <ChevronDown className="shrink-0 size-5" />
                  </>
                )}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {activeSection === 'form' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <Form {...form}>
                    <form
                      ref={formRef}
                      onSubmit={form.handleSubmit((data) =>
                        console.log({ data }),
                      )}
                      className="space-y-6"
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
                    </form>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Separator className="bg-neutral-500 my-3" />

          <Button className="bg-neutral-700 text-neutral-200 hover:bg-neutral-700 hover:text-neutral-300 w-full">
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
