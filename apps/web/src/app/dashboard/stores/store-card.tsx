'use client';

import { motion } from 'framer-motion';
import { ChevronRight, MapPin, Store, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

interface StoreCardProps {
  store: {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    isMain: boolean;
    isActive: boolean;
    admin: {
      name: string;
      email: string;
      image?: string;
    };
  };
  index: number;
}

export default function StoreCard({ store, index }: StoreCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={`overflow-hidden transition-all duration-300 ${
          isHovered
            ? 'shadow-lg transform -translate-y-1 border-neutral-300 bg-white'
            : 'shadow-sm border-neutral-200 bg-white/80'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-400 via-neutral-600 to-neutral-900 opacity-80"></div>

        <CardHeader className="relative pb-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100/50"></div>
          <div className="absolute inset-0 bg-[url('/patterns/subtle-dots.svg')] opacity-5"></div>

          {isHovered && (
            <motion.div
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-neutral-900/5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          <div className="relative z-10 flex items-center gap-4">
            <motion.div
              className={`flex-shrink-0 rounded-full p-3 transition-all duration-300 ${
                isHovered
                  ? 'bg-neutral-100 shadow-md border border-neutral-200'
                  : 'bg-neutral-50 shadow-sm border border-neutral-100'
              }`}
              whileHover={{ rotate: 5 }}
            >
              <Store
                className={`h-10 w-10 transition-colors duration-300 ${
                  isHovered ? 'text-neutral-800' : 'text-neutral-600'
                }`}
              />
            </motion.div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg line-clamp-1 text-neutral-800">
                    {store.name}
                  </h3>
                  <div className="flex items-center text-sm text-neutral-500">
                    <User className="mr-1 h-3 w-3" />
                    <span>{store.admin.name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {store.isMain && (
                    <Badge className="bg-neutral-900 hover:bg-neutral-800 transition-colors">
                      Utama
                    </Badge>
                  )}
                  <Badge
                    variant={store.isActive ? 'default' : 'outline'}
                    className={
                      store.isActive
                        ? 'bg-neutral-900 hover:bg-neutral-800'
                        : 'text-neutral-500'
                    }
                  >
                    {store.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 relative">
          {isHovered && (
            <motion.div
              className="absolute -left-6 bottom-0 w-16 h-16 rounded-full bg-neutral-900/5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            />
          )}

          <div className="space-y-3 relative z-10">
            <div className="flex items-start gap-2 group">
              <div className="bg-neutral-100 p-1.5 rounded-md transition-all duration-300 group-hover:bg-neutral-200">
                <MapPin className="h-4 w-4 text-neutral-600 shrink-0" />
              </div>
              <div className="text-sm text-neutral-700">
                <p className="line-clamp-2 font-medium">{store.address}</p>
                <p className="text-neutral-500">
                  {store.city}, {store.province} {store.postalCode}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-gradient-to-br from-white to-neutral-50/50 flex justify-between pt-3 relative overflow-hidden">
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-neutral-100/50 via-white to-neutral-100/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          <Button
            variant="outline"
            size="sm"
            className={`border-neutral-200 transition-all duration-300 relative z-10 ${
              isHovered
                ? 'bg-neutral-50 text-neutral-700'
                : 'hover:bg-neutral-50 hover:text-neutral-700'
            }`}
            onClick={() => router.push(`/dashboard/stores/${store.id}`)}
          >
            Detail
          </Button>
          <Button
            variant="default"
            size="sm"
            className={`transition-all duration-300 relative z-10 group ${
              isHovered
                ? 'bg-neutral-900'
                : 'bg-neutral-800 hover:bg-neutral-900'
            }`}
            onClick={() => router.push(`/dashboard/stores/${store.id}/edit`)}
          >
            Edit
            <ChevronRight className="h-3 w-3 ml-1 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
