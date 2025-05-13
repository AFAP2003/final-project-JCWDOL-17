import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Truck, Package } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ShipOrderModalProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShipOrderModal({
  order,
  open,
  onOpenChange,
}: ShipOrderModalProps) {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStockSufficient, setIsStockSufficient] = useState(true);
  const [stockStatus, setStockStatus] = useState([]);

  useEffect(() => {
    if (order && open) {
      // Reset form
      setTrackingNumber('');
      setNotes('');

      // Check inventory status for this order
      checkInventoryStatus();
    }
  }, [order, open]);

  const checkInventoryStatus = async () => {
    if (!order) return;

    try {
      // Call your API to check inventory status for all items in this order
      const response = await fetch(`/api/orders/${order.id}/check-stock`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to check inventory status');
      }

      const data = await response.json();
      setStockStatus(data.items);

      // Check if all items have sufficient stock
      setIsStockSufficient(data.items.every((item) => item.isSufficient));
    } catch (error) {
      console.error('Error checking inventory status:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat memeriksa status stok.',
        variant: 'destructive',
      });
    }
  };

  const handleShipOrder = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: 'Nomor Resi Diperlukan',
        description: 'Harap masukkan nomor resi untuk pengiriman.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Call your API to ship the order
      const response = await fetch(`/api/orders/${order.id}/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to ship order');
      }

      toast({
        title: 'Pesanan Dikirim',
        description: 'Pesanan telah berhasil diubah menjadi status dikirim.',
        variant: 'default',
      });

      // Close the modal
      onOpenChange(false);

      // You might want to refresh the order data here or redirect
    } catch (error) {
      console.error('Error shipping order:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat mengirim pesanan.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kirim Pesanan</DialogTitle>
          <DialogDescription>
            Siapkan pengiriman untuk pesanan #{order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Order Summary */}
          <div className="space-y-2">
            <h3 className="font-semibold">Detail Pesanan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-medium">Pelanggan:</span>{' '}
                  {order.user?.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {order.user?.email}
                </p>
                <p>
                  <span className="font-medium">Total Item:</span>{' '}
                  {order.items.length} item
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">Metode Pengiriman:</span>{' '}
                  {order.shippingMethod}
                </p>
                <p>
                  <span className="font-medium">Tanggal Pesanan:</span>{' '}
                  {new Date(order.createdAt).toLocaleDateString('id-ID')}
                </p>
                <p>
                  <span className="font-medium">Total Pesanan:</span>{' '}
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stock Status Alert */}
          {!isStockSufficient && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-yellow-400 mr-2" />
                <h3 className="font-medium text-yellow-800">Peringatan Stok</h3>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Beberapa produk dalam pesanan ini memiliki stok yang tidak
                mencukupi. Pastikan transfer stok fisik telah dilakukan sebelum
                mengirim pesanan.
              </p>
            </div>
          )}

          {/* Shipping Address */}
          <div className="space-y-2">
            <h3 className="font-semibold">Alamat Pengiriman</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium">{order.recipientName}</p>
              <p>{order.recipientPhone}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.city}, {order.province} {order.postalCode}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <Accordion type="single" collapsible defaultValue="items">
            <AccordionItem value="items">
              <AccordionTrigger className="font-semibold">
                Item Pesanan ({order.items.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 mt-2">
                  {order.items.map((item) => {
                    // Find the stock status for this item
                    const itemStockStatus = stockStatus.find(
                      (stock) => stock.productId === item.productId,
                    );

                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {formatCurrency(item.price)}
                          </p>
                        </div>

                        {itemStockStatus && (
                          <div
                            className={`text-sm ${itemStockStatus.isSufficient ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {itemStockStatus.isSufficient
                              ? `Stok Cukup (${itemStockStatus.available} tersedia)`
                              : `Stok Kurang (${itemStockStatus.available}/${item.quantity})`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />

          {/* Shipping Information Form */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informasi Pengiriman</h3>

            <div className="space-y-2">
              <Label htmlFor="trackingNumber" className="font-medium">
                Nomor Resi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="trackingNumber"
                placeholder="Masukkan nomor resi"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-medium">
                Catatan (opsional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan untuk pengiriman"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleShipOrder}
            disabled={loading || !trackingNumber.trim()}
          >
            <Truck className="mr-2 h-4 w-4" />
            Kirim Pesanan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
