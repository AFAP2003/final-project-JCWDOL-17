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
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, XCircle, RefreshCw } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { apiclient } from '@/lib/apiclient';
import { formatCurrency } from '@/lib/utils';

interface CancelOrderModalProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCanceled?: () => void;
}

export default function CancelOrderModal({
  order,
  open,
  onOpenChange,
  onCanceled,
}: CancelOrderModalProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [stockImpacts, setStockImpacts] = useState<any[]>([]);
  const [checkingStockImpact, setCheckingStockImpact] = useState(false);

  useEffect(() => {
    if (open && order) {
      setReason('');
      if (canCancelOrder()) {
        getStockImpact();
      }
    }
  }, [open, order]);

  const canCancelOrder = () => {
    if (!order) return false;

    const cancellableStatuses = [
      'WAITING_PAYMENT',
      'WAITING_PAYMENT_CONFIRMATION',
      'PROCESSING',
    ];

    return cancellableStatuses.includes(order.status);
  };

  const getStockImpact = async () => {
    if (!order) return;

    if (order.status !== 'PROCESSING') {
      setStockImpacts([]);
      return;
    }

    setCheckingStockImpact(true);
    try {
      const response = await apiclient.get(
        `/dashboard/orders/check-stock/${order.id}`,
      );
      setStockImpacts(response.data.stockChecks || []);
    } catch (error) {
      console.error('Error checking stock impact:', error);
      toast({
        title: 'Gagal',
        description: 'Tidak dapat memeriksa dampak stok untuk pesanan ini.',
        variant: 'destructive',
      });
    } finally {
      setCheckingStockImpact(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Alasan Diperlukan',
        description: 'Harap berikan alasan pembatalan pesanan.',
        variant: 'destructive',
      });
      return;
    }

    setConfirmCancel(true);
  };

  const confirmCancelOrder = async () => {
    setConfirmCancel(false);
    setLoading(true);

    try {
      const response = await apiclient.post(`/dashboard/orders/cancel`, {
        orderId: order.id,
        reason: reason.trim(),
      });

      if (!response.data) {
        throw new Error('Failed to cancel order');
      }

      toast({
        title: 'Pesanan Dibatalkan',
        description:
          'Pesanan telah berhasil dibatalkan dan stok telah dikembalikan.',
        variant: 'default',
      });

      onOpenChange(false);
      if (onCanceled) {
        onCanceled();
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        title: 'Gagal',
        description:
          'Terjadi kesalahan saat membatalkan pesanan. Silakan coba lagi.',
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Batalkan Pesanan</DialogTitle>
            <DialogDescription>
              Batalkan pesanan #{order.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge
                  variant={
                    order.status === 'PROCESSING'
                      ? 'default'
                      : order.status === 'WAITING_PAYMENT'
                        ? 'outline'
                        : 'secondary'
                  }
                >
                  {order.status === 'PROCESSING'
                    ? 'Diproses'
                    : order.status === 'WAITING_PAYMENT'
                      ? 'Menunggu Pembayaran'
                      : 'Menunggu Konfirmasi'}
                </Badge>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Pelanggan:</span>
                <span>{order.user?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Warning Notice */}
            {!canCancelOrder() && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <h3 className="font-medium text-red-800">
                    Tidak Dapat Dibatalkan
                  </h3>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Pesanan dengan status{' '}
                  {order.status === 'SHIPPED'
                    ? 'Dikirim'
                    : order.status === 'CONFIRMED'
                      ? 'Selesai'
                      : order.status === 'CANCELLED'
                        ? 'Dibatalkan'
                        : order.status}
                  tidak dapat dibatalkan. Hanya pesanan dengan status "Menunggu
                  Pembayaran", "Menunggu Konfirmasi", atau "Diproses" yang dapat
                  dibatalkan.
                </p>
              </div>
            )}

            {canCancelOrder() && (
              <>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                    <h3 className="font-medium text-yellow-800">
                      Pemberitahuan
                    </h3>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Pembatalan pesanan akan mengembalikan stok ke gudang dan
                    tidak dapat dibatalkan. Pastikan alasan pembatalan sudah
                    sesuai.
                  </p>
                </div>

                {/* Stock Impact Section (if processing) */}
                {order.status === 'PROCESSING' && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Dampak Stok:</h3>
                    {checkingStockImpact ? (
                      <div className="flex items-center justify-center py-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">
                          Memeriksa dampak stok...
                        </span>
                      </div>
                    ) : stockImpacts.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto space-y-2 bg-gray-50 p-2 rounded-md">
                        {stockImpacts.map((item, index) => (
                          <div
                            key={index}
                            className="text-sm flex justify-between"
                          >
                            <span className="truncate">{item.productName}</span>
                            <span className="font-medium text-green-600">
                              +{item.required} akan dikembalikan
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Tidak ada dampak stok untuk ditampilkan.
                      </p>
                    )}
                  </div>
                )}

                {/* Cancellation Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason" className="font-medium">
                    Alasan Pembatalan <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Harap berikan alasan pembatalan pesanan"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Alasan pembatalan akan dicatat dalam sistem dan mungkin
                    ditampilkan kepada pelanggan.
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Kembali
            </Button>
            {canCancelOrder() && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={loading || !reason.trim() || checkingStockImpact}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Membatalkan...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Batalkan Pesanan
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pembatalan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan pesanan ini?{' '}
              {order.status === 'PROCESSING' &&
                'Stok akan dikembalikan ke inventaris '}
              dan status pesanan akan diubah menjadi "Dibatalkan".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Batalkan Pesanan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
