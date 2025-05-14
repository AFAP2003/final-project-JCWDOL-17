import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { refetchNow } from '@/lib/tanstack-query';
import { GetAllAvailableAdminResponse } from '@/lib/types/get-all-available-admin-response';
import { GetStoreByIdResponse } from '@/lib/types/get-store-by-id-response';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CircleMinus, MapPin, UserIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { z } from 'zod';
const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
});

const formSchema = z.object({
  name: z.string().trim().min(2, {
    message: 'Nama toko minimal terdiri dari 2 karakter.',
  }),
  address: z.string().trim().min(5, {
    message: 'Alamat minimal terdiri dari 5 karakter.',
  }),
  city: z.string().trim().min(2, {
    message: 'Nama kota minimal terdiri dari 2 karakter.',
  }),
  province: z.string().trim().min(2, {
    message: 'Nama provinsi minimal terdiri dari 2 karakter.',
  }),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, {
      message: 'Kode pos harus terdiri dari 5 digit angka.',
    }),
  latitude: z.coerce
    .number()
    .min(-90, {
      message: 'Latitude harus bernilai antara -90 hingga 90.',
    })
    .max(90, {
      message: 'Latitude harus bernilai antara -90 hingga 90.',
    }),
  longitude: z.coerce
    .number()
    .min(-180, {
      message: 'Longitude harus bernilai antara -180 hingga 180.',
    })
    .max(180, {
      message: 'Longitude harus bernilai antara -180 hingga 180.',
    }),
  maxDistance: z.coerce.number().positive({
    message: 'Jarak maksimum harus berupa angka positif.',
  }),
  adminId: z
    .string()
    .trim()
    .uuid({
      message: 'ID admin harus berupa UUID yang valid.',
    })
    .or(z.literal('')),
});

type SchemaType = z.infer<typeof formSchema>;

type Props = {
  store?: GetStoreByIdResponse;
};

const StoreForm = ({ store }: Props) => {
  const router = useRouter();
  const form = useForm<SchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: store?.name || '',
      address: store?.address || '',
      city: store?.city || '',
      province: store?.province || '',
      postalCode: store?.postalCode || '',
      latitude: store?.latitude || 0,
      longitude: store?.longitude || 0,
      maxDistance: store?.maxDistance || 10,
      adminId: store?.adminId || '',
    },
  });
  const [redirecting, startTransition] = useTransition();

  const {
    data: admins,
    isPending: adminPending,
    isError,
  } = useQuery({
    queryKey: ['all:available:admin', store?.id],
    queryFn: async () => {
      const { data } = await apiclient.get<GetAllAvailableAdminResponse>(
        '/user/available-admin',
      );
      return data;
    },
  });

  const { mutate, isPending: mutatePending } = useMutation({
    mutationFn: async (payload: SchemaType) => {
      if (store) {
        const { data } = await apiclient.put(`/store/${store.id}`, {
          ...payload,
          adminId: payload.adminId ? payload.adminId : null,
        });
        return data;
      } else {
        const { data } = await apiclient.post(`/store`, {
          ...payload,
          adminId: payload.adminId ? payload.adminId : null,
        });
        return data;
      }
    },
    onError: () => {
      toast({
        description:
          'Sorry we have problem in our server. Please try again later',
        variant: 'destructive',
      });
    },
    onSuccess: (data: any) => {
      toast({
        description: store
          ? 'Success updating data toko'
          : 'Success creating new toko',
      });
      refetchNow(['id:store']);
      startTransition(() => {
        router.push(`/dashboard/stores/${data.id}`);
      });
    },
  });

  return (
    <Card className="max-wl mx-auto">
      <CardHeader className="space-y-1 max-w-4xl mx-auto text-neutral-700">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-neutral-700" />
          <CardTitle className="text-2xl font-bold">
            {store ? 'Edit Toko' : 'Buat Toko'}
          </CardTitle>
        </div>
        <CardDescription>
          {store
            ? 'Perbarui informasi toko ini untuk memastikan data tetap akurat dan lengkap.'
            : 'Tambahkan toko baru untuk mulai mengelola produk dan penjualannya.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-4xl mx-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutate(data))}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Toko</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukan nama toko" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Admin Toko</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        if (val === 'none') {
                          field.onChange('');
                        } else {
                          field.onChange(val);
                        }
                      }}
                      value={field.value ? field.value : undefined}
                      disabled={adminPending || isError}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {(() => {
                            let admin = admins?.find(
                              (a) => a.id === field.value,
                            );
                            if (!admin && field.value === store?.admin?.id) {
                              admin = store?.admin as any;
                            }

                            if (admin) {
                              return (
                                <div className="flex items-center gap-2">
                                  <UserIcon className="text-neutral-700 size-5" />
                                  <span className="text-neutral-700">
                                    {admin.name}
                                  </span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex items-center gap-2">
                                  <CircleMinus className="text-neutral-700 size-5" />
                                  <span className="text-neutral-700">
                                    Belum dipilih
                                  </span>
                                </div>
                              );
                            }
                          })()}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        style={{ zIndex: 1000 }}
                        className="text-neutral-700"
                      >
                        {admins && admins.length && (
                          <>
                            {admins.map((admin) => (
                              <SelectItem key={admin.id} value={admin.id}>
                                <div className="flex items-center gap-2">
                                  <UserIcon />
                                  <div className="flex flex-col">
                                    <span>{admin.name}</span>
                                    <span className="text-xs italic">
                                      {admin.email}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                        {store && store.admin && (
                          <SelectItem
                            key={store.admin.id}
                            value={store.admin.id}
                          >
                            <div className="flex items-center gap-2">
                              <UserIcon />
                              <div className="flex flex-col">
                                <span>{store.admin.name}</span>
                                <span className="text-xs italic">
                                  {store.admin.email}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        )}

                        <SelectItem value={'none'}>
                          <div className="flex items-center gap-2">
                            <CircleMinus />
                            <div className="flex flex-col">
                              <span>Pilih Nanti</span>
                              <span className="text-xs italic">
                                Kosongi dulu
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {(!admins || !admins.length) && !store && !adminPending && (
                      <FormDescription>
                        *Tidak ada admin yang tersedia
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            <h3 className="text-lg font-medium">Informasi Lokasi</h3>

            <div className="space-y-4">
              <div className="p-4 bg-neutral-200 rounded-lg">
                <Map
                  initialPosition={(() => {
                    const initialpoint: { lat: number; lng: number } = {
                      lat: -6.175205678767613,
                      lng: 106.82716967509717,
                    };
                    if (store) {
                      initialpoint.lat = store.latitude;
                      initialpoint.lng = store.longitude;
                    }
                    return initialpoint;
                  })()}
                  onLocationChange={(loc, isInitial) => {
                    if (store && isInitial) {
                      return;
                    } else if (loc) {
                      form.setValue('address', loc.address);
                      form.setValue('city', loc.city || '');
                      form.setValue('province', loc.province || '');
                      form.setValue('postalCode', loc.postalCode || '');
                      form.setValue('latitude', loc.latitude);
                      form.setValue('longitude', loc.longitude);
                    }
                  }}
                  onLocationChangePending={() => {}}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Toko</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukan alamat lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kota</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukan kota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provinsi</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukan provinsi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukan kode pos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            <h3 className="text-lg font-medium">Coverage</h3>

            <FormField
              control={form.control}
              name="maxDistance"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Maksimal Jarak Pengiriman (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="Enter maximum delivery distance"
                      value={value?.toString() ?? ''}
                      onChange={(e) => onChange(e.target.value)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={mutatePending} type="submit" className="w-full">
              {redirecting
                ? 'Redirecting...'
                : store
                  ? 'Save Changes'
                  : 'Create Store'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StoreForm;
