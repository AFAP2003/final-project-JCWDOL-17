import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';
import { MapPin, Pencil, Phone, Star, Trash2 } from 'lucide-react';

type Props = {
  address: GetAllAddressResponse['addresses'][number];
  onEdit: (address: GetAllAddressResponse['addresses'][number]) => void;
  onDelete: (address: GetAllAddressResponse['addresses'][number]) => void;
  disabled: boolean;
};

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  disabled,
}: Props) {
  return (
    <Card className="w-full overflow-hidden border shadow-sm transition-all">
      <CardHeader className="bg-neutral-200 py-3">
        <div className="max-sm:flex-col max-sm:items-start max-sm:gap-y-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-neutral-700" />
            <h3 className="text-base font-semibold text-neutral-700">
              {address.label}
            </h3>
          </div>
          {address.isDefault && (
            <Badge className="bg-neutral-100 text-neutral-700 hover:bg-neutral-100">
              <Star className="mr-1 h-3 w-3 text-neutral-800 fill-neutral-800 " />{' '}
              Default
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-2 bg-neutral-50">
        <div className="space-y-3">
          <div className="space-y-1 flex flex-row w-full justify-between items-center">
            {/* ADDRESS HEADER */}
            <div className="flex flex-row gap-3 w-full items-center">
              <p className="font-medium text-neutral-700">
                {address.recipient}
              </p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-netural-700" />
                <p className="text-sm text-neutral-600">{address.phone}</p>
              </div>
            </div>

            {/* ACTION MD */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 max-sm:hidden">
              <Button
                disabled={disabled}
                onClick={() => onEdit(address)}
                variant="outline"
                size="sm"
                className="text-neutral-700 rounded-lg hover:bg-neutral-100 hover:text-neutral-700"
              >
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                disabled={disabled}
                onClick={() => onDelete(address)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>

          <div className="space-y-1 border-l-2 border-neutral-400 pl-3 text-sm">
            <p className="text-neutral-500">{address.address}</p>
            <p className="text-neutral-500">
              {address.city}, {address.province} {address.postalCode}
            </p>
          </div>

          {/* ACTION SM */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:hidden">
            <Button
              disabled={disabled}
              onClick={() => onEdit(address)}
              variant="outline"
              size="sm"
              className="text-neutral-700 rounded-lg hover:bg-neutral-100 hover:text-neutral-700"
            >
              <Pencil className="mr-1 h-4 w-4" />
              Edit
            </Button>
            <Button
              disabled={disabled}
              onClick={() => onDelete(address)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
