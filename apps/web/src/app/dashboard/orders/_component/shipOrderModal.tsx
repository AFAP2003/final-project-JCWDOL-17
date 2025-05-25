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
import orderManagementAPI from '@/lib/apis/dashboard/orderManagement.api';
import { ShipOrderModalProps } from '@/lib/interfaces/orders';

export default function ShipOrderModal({
  order,
  open,
  onOpenChange,
  isPending = false,
  onSuccess,
}: ShipOrderModalProps) {
  const { toast } = useToast();
  const { handleShipOrder, checkOrderStock } = orderManagementAPI();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStockSufficient, setIsStockSufficient] = useState(true);
  const [stockStatus, setStockStatus] = useState<any[]>([]);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [notifyAutoConfirmation, setNotifyAutoConfirmation] = useState(false);

  useEffect(() => {
    if (order && open) {
      setTrackingNumber('');
      setNotes('');
      setNotifyAutoConfirmation(false);

      checkInventoryStatus();
    }
  }, [order, open]);

  const checkInventoryStatus = async () => {
    if (!order) return;
    setIsCheckingStock(true);

    try {
      const data = await checkOrderStock(order.id);

      if (data && data.items) {
        // Map API response to component's expected format
        const mappedItems = data.items.map((item: any) => ({
          productName: item.productName,
          orderQuantity: item.required,
          stockQuantity: item.available,
        }));

        setStockStatus(mappedItems);
        setIsStockSufficient(data.hasAllStock || false);
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
      setIsCheckingStock(false);
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

  const handleShipOrderConfirm = async () => {
    setConfirmDialogOpen(false);
    if (!trackingNumber.trim() || !order) return;

    setLoading(true);
    try {
      await handleShipOrder(order.id, trackingNumber, notes);

      toast({
        title: 'Pesanan Dikirim',
        description:
          'Pesanan telah berhasil diubah menjadi status dikirim dan akan otomatis dikonfirmasi dalam 7 hari jika pelanggan tidak mengkonfirmasi.',
        variant: 'default',
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
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
                Pesanan yang telah dikirim akan memerlukan konfirmasi dari
                pelanggan untuk dianggap selesai. Jika pelanggan tidak
                mengkonfirmasi dalam 7 hari, status pesanan akan otomatis
                berubah menjadi "Selesai".
              </p>
            </div>

            {/* Stock Status Alert */}
            {!isStockSufficient && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-yellow-400 mr-2" />
                  <h3 className="font-medium text-yellow-800">
                    Peringatan Stok
                  </h3>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Beberapa produk dalam pesanan ini memiliki stok yang tidak
                  mencukupi. Harap periksa stok sebelum memproses pengiriman.
                </p>
              </div>
            )}

            {/* Stock Status Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Status Stok</h3>
                {isCheckingStock && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Memeriksa stok...
                  </div>
                )}
              </div>

              {stockStatus.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="stock-status">
                    <AccordionTrigger className="text-sm">
                      {isStockSufficient
                        ? 'Semua item tersedia untuk dikirim'
                        : 'Beberapa item memiliki stok tidak cukup'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {stockStatus.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm py-1 border-b"
                          >
                            <div className="flex-1 mr-4 truncate">
                              {item.productName}
                            </div>
                            <div className="flex items-center gap-4">
                              <span>
                                Dipesan:{' '}
                                <span className="font-medium">
                                  {item.orderQuantity}
                                </span>
                              </span>
                              <span>
                                Stok:{' '}
                                <span
                                  className={
                                    item.stockQuantity >= item.orderQuantity
                                      ? 'font-medium text-green-600'
                                      : 'font-medium text-red-600'
                                  }
                                >
                                  {item.stockQuantity}
                                </span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {isCheckingStock
                    ? 'Memeriksa status stok...'
                    : 'Tidak ada informasi stok yang tersedia.'}
                </div>
              )}
            </div>

            <Separator />

            {/* Shipping Information */}
            <div className="space-y-2">
              <h3 className="font-semibold">Informasi Pengiriman</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">
                    Nomor Resi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="trackingNumber"
                    placeholder="Masukkan nomor resi pengiriman"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingNotes">
                    Catatan Pengiriman (opsional)
                  </Label>
                  <Textarea
                    id="shippingNotes"
                    placeholder="Tambahkan catatan untuk pengiriman"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleOpenConfirmDialog}
              disabled={
                loading ||
                isPending ||
                !trackingNumber.trim() ||
                isCheckingStock ||
                (!isStockSufficient && stockStatus.length > 0)
              }
              className="gap-2"
            >
              {loading || isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  Kirim Pesanan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengiriman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengirim pesanan ini dengan nomor resi{' '}
              <span className="font-medium">{trackingNumber}</span>?
              {notifyAutoConfirmation && (
                <p className="mt-2">
                  Pelanggan akan memiliki waktu 7 hari untuk mengonfirmasi
                  penerimaan pesanan, setelah itu pesanan akan otomatis
                  terkonfirmasi.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleShipOrderConfirm}>
              Ya, Kirim Pesanan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
