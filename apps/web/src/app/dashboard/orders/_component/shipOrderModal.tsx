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
import { Truck, Package, Info, RefreshCw } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiclient } from '@/lib/apiclient';

interface ShipOrderModalProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShip?: (orderId: string, trackingNumber: string, notes?: string) => Promise<boolean>;
  checkStock?: (orderId: string) => Promise<any>;
  isPending?: boolean;
  isCheckingStock?: boolean;
  onSuccess?: () => void;
}

export default function ShipOrderModal({
  order,
  open,
  onOpenChange,
  onShip,
  checkStock,
  isPending = false,
  isCheckingStock = false,
  onSuccess,
}: ShipOrderModalProps) {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStockSufficient, setIsStockSufficient] = useState(true);
  const [stockStatus, setStockStatus] = useState<any[]>([]);
  const [checkingStock, setCheckingStock] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [notifyAutoConfirmation, setNotifyAutoConfirmation] = useState(false);

  useEffect(() => {
    if (order && open) {
      // Reset form
      setTrackingNumber('');
      setNotes('');
      setNotifyAutoConfirmation(false);

      // Check inventory status for this order
      checkInventoryStatus();
    }
  }, [order, open]);

  const checkInventoryStatus = async () => {
    if (!order) return;
    setCheckingStock(true);

    try {
      if (checkStock) {
        const data = await checkStock(order.id);
        if (data && data.items) {
          setStockStatus(data.items);
          setIsStockSufficient(data.items.every((item) => item.isSufficient));
        } else {
          throw new Error('Invalid stock check response');
        }
      } else {
        // Fallback to direct API call
        const response = await apiclient.get(`/orders/check-stock/${order.id}`);
        
        if (response.data && response.data.items) {
          setStockStatus(response.data.items);
          setIsStockSufficient(response.data.items.every((item) => item.isSufficient));
        } else {
          throw new Error('Invalid stock check response');
        }
      }
    } catch (error) {
      console.error('Error checking inventory status:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat memeriksa status stok.',
        variant: 'destructive',
      });
      setStockStatus([]);
      setIsStockSufficient(false);
    } finally {
      setCheckingStock(false);
    }
  };

  const handleOpenConfirmDialog = () => {
    if (!trackingNumber.trim()) {
      toast({
        title: 'Nomor Resi Diperlukan',
        description: 'Harap masukkan nomor resi untuk pengiriman.',
        variant: 'destructive',
      });
      return;
    }
    setConfirmDialogOpen(true);
    setNotifyAutoConfirmation(true);
  };

  const handleShipOrder = async () => {
    setConfirmDialogOpen(false);
    if (!trackingNumber.trim()) return;

    setLoading(true);
    try {
      if (onShip) {
        const success = await onShip(order.id, trackingNumber, notes);
        if (success) {
          toast({
            title: 'Pesanan Dikirim',
            description: 'Pesanan telah berhasil diubah menjadi status dikirim dan akan otomatis dikonfirmasi dalam 7 hari jika pelanggan tidak mengkonfirmasi.',
            variant: 'default',
          });
          onOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          throw new Error('Failed to ship order');
        }
      } else {
        // Fallback to direct API call
        const response = await apiclient.post(`/orders/ship`, {
          orderId: order.id,
          trackingNumber,
          notes,
        });

        if (!response.data) {
          throw new Error('Failed to ship order');
        }

        toast({
          title: 'Pesanan Dikirim',
          description: 'Pesanan telah berhasil diubah menjadi status dikirim dan akan otomatis dikonfirmasi dalam 7 hari jika pelanggan tidak mengkonfirmasi.',
          variant: 'default',
        });

        onOpenChange(false);
      }
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
    <>
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

            {/* Stock Status Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-medium text-blue-800">Informasi Penting</h3>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Pesanan yang telah dikirim akan memerlukan konfirmasi dari pelanggan untuk dianggap selesai. Jika pelanggan tidak mengkonfirmasi dalam 7 hari, status pesanan akan otomatis berubah menjadi "Selesai".
              </p>
            </div>

            {/* Stock Status Alert */}
            {!isStockSufficient && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-yellow-400 mr-2" />
                  <h3 className="font-medium text-yellow-800">Peringatan Stok</h3>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Beberapa produk dalam pesanan ini memil
