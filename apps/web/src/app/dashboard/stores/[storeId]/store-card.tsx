'use client';

import { format } from 'date-fns';
import { Calendar, CheckCircle, MapPin, User, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Map = dynamic(() => import('@/components/map-static'), {
  ssr: false,
});

type Store = {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  maxDistance: number;
  isActive: boolean;
  createdAt: string; // or Date
  adminId?: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
};

interface Props {
  store: Store;
}

export default function StoreCard({ store }: Props) {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Details - Left Side */}
        <Card className="lg:col-span-2 shadow-md bg-white/80">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative size-32">
                <Image src={'/images/toko-image.png'} alt="Toko Icon" fill />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-3xl font-bold text-neutral-700 flex gap-3 items-center">
                  <span>{store.name}</span>
                </CardTitle>
                <div className="flex items-center text-neutral-500">
                  <MapPin className="h-5 w-5 mr-2 text-neutral-500" />
                  <span>
                    {store.city}, {store.province}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-neutral-700">
                Alamat Lengkap
              </h3>
              <p className="text-neutral-700">{store.address}</p>
              <p className="text-neutral-700">
                {store.city}, {store.province} {store.postalCode}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 text-neutral-700">
                Detail Toko
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-sm text-neutral-500">
                    Max Service Distance
                  </p>
                  <p className="text-neutral-700">{store.maxDistance} km</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Berdiri Sejak</p>
                  <div className="flex items-center text-neutral-700">
                    <Calendar className="h-4 w-4 mr-2 text-neutral-500" />
                    <span>{format(store.createdAt, 'dd MMMM, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-6 text-neutral-700">
                Location
              </h3>
              <div className="bg-neutral-100 rounded-lg flex flex-col items-center justify-center text-neutral-500 p-6">
                <Map
                  position={{
                    lat: store.latitude,
                    lng: store.longitude,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side */}
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="border-b border-neutral-200 pb-3">
              <CardTitle className="text-xl font-semibold text-neutral-700">
                Administrator Toko
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center mr-4 shrink-0">
                  <User className="h-6 w-6 text-neutral-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-700">
                    {store.admin?.name || 'Belum ada'}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {store.admin?.email || 'Belum ada'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="border-b border-neutral-200 pb-3">
              <CardTitle className="text-xl font-semibold text-neutral-700">
                Status Toko
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center">
                {store.isActive ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    <Badge
                      variant="outline"
                      className="border-green-300 bg-green-100 text-green-800 font-medium px-3 py-1 text-sm hover:bg-green-100/80"
                    >
                      Active
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-500 mr-2" />
                    <Badge
                      variant="outline"
                      className="border-red-300 bg-red-100 text-red-700 font-medium px-3 py-1 text-sm hover:bg-red-100/80"
                    >
                      Inactive
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
